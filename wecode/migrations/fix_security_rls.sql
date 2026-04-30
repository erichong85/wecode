-- WeCode 安全性修复：正确的 RLS 策略
-- 在 Supabase SQL Editor 中执行此文件

-- ==========================================
-- 1. sites 表 RLS 策略
-- ==========================================

-- 先删除旧的不安全策略
DROP POLICY IF EXISTS "Public read" ON sites;
DROP POLICY IF EXISTS "Public insert" ON sites;
DROP POLICY IF EXISTS "Public update" ON sites;
DROP POLICY IF EXISTS "Public delete" ON sites;

-- 读取：已发布且公开的 site 所有人可读；自己的 site 可读
CREATE POLICY "Anyone can read public published sites"
  ON sites FOR SELECT
  USING (published = true AND is_public = true);

CREATE POLICY "Users can read own sites"
  ON sites FOR SELECT
  USING (auth.uid()::text = user_id);

-- 插入：仅登录用户可插入自己的 site
CREATE POLICY "Users can insert own sites"
  ON sites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- 更新：仅更新自己的 site
CREATE POLICY "Users can update own sites"
  ON sites FOR UPDATE
  USING (auth.uid()::text = user_id);

-- 删除：仅删除自己的 site
CREATE POLICY "Users can delete own sites"
  ON sites FOR DELETE
  USING (auth.uid()::text = user_id);

-- ==========================================
-- 2. users 表 RLS 策略
-- ==========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 用户可读取自己的信息
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id);

-- Admin 可读取所有用户
CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid()::text AND u.role = 'admin'
    )
  );

-- ==========================================
-- 3. user_likes 表 RLS 策略
-- ==========================================

ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own likes"
  ON user_likes FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own likes"
  ON user_likes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own likes"
  ON user_likes FOR DELETE
  USING (auth.uid()::text = user_id);

-- ==========================================
-- 4. user_favorites 表 RLS 策略
-- ==========================================

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid()::text = user_id);

-- ==========================================
-- 5. prompts 表 RLS 策略
-- ==========================================

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- 所有人可读 system prompts
CREATE POLICY "Anyone can read system prompts"
  ON prompts FOR SELECT
  USING (is_system = true);

-- 用户可读自己的 prompts
CREATE POLICY "Users can read own prompts"
  ON prompts FOR SELECT
  USING (auth.uid()::text = author_id);

-- 用户可插入自己的 prompts
CREATE POLICY "Users can insert own prompts"
  ON prompts FOR INSERT
  WITH CHECK (auth.uid()::text = author_id);

-- 用户可更新自己的 prompts
CREATE POLICY "Users can update own prompts"
  ON prompts FOR UPDATE
  USING (auth.uid()::text = author_id);

-- 用户可删除自己的 prompts
CREATE POLICY "Users can delete own prompts"
  ON prompts FOR DELETE
  USING (auth.uid()::text = author_id);

-- ==========================================
-- 6. 点赞/收藏原子操作 (P2 #11)
-- 替换掉客户端的 increment/decrement RPC
-- ==========================================

-- 点赞 toggle（原子操作）
CREATE OR REPLACE FUNCTION toggle_like(p_user_id TEXT, p_site_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_liked BOOLEAN;
BEGIN
  -- Check if already liked
  IF EXISTS (SELECT 1 FROM user_likes WHERE user_id = p_user_id AND site_id = p_site_id) THEN
    -- Unlike
    DELETE FROM user_likes WHERE user_id = p_user_id AND site_id = p_site_id;
    UPDATE sites SET likes = GREATEST(0, likes - 1) WHERE id = p_site_id;
    v_liked := FALSE;
  ELSE
    -- Like
    INSERT INTO user_likes (user_id, site_id, created_at) VALUES (p_user_id, p_site_id, NOW());
    UPDATE sites SET likes = likes + 1 WHERE id = p_site_id;
    v_liked := TRUE;
  END IF;
  
  RETURN jsonb_build_object('liked', v_liked);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 收藏 toggle（原子操作）
CREATE OR REPLACE FUNCTION toggle_favorite(p_user_id TEXT, p_site_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_favorited BOOLEAN;
BEGIN
  -- Check if already favorited
  IF EXISTS (SELECT 1 FROM user_favorites WHERE user_id = p_user_id AND site_id = p_site_id) THEN
    -- Unfavorite
    DELETE FROM user_favorites WHERE user_id = p_user_id AND site_id = p_site_id;
    UPDATE sites SET favorites = GREATEST(0, favorites - 1) WHERE id = p_site_id;
    v_favorited := FALSE;
  ELSE
    -- Favorite
    INSERT INTO user_favorites (user_id, site_id, created_at) VALUES (p_user_id, p_site_id, NOW());
    UPDATE sites SET favorites = favorites + 1 WHERE id = p_site_id;
    v_favorited := TRUE;
  END IF;
  
  RETURN jsonb_build_object('favorited', v_favorited);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 安全的浏览量递增
CREATE OR REPLACE FUNCTION increment_views(p_site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sites SET views = views + 1 WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
