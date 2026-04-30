-- WeCode RLS 策略冲突修复
-- 在 Supabase SQL Editor 中执行此文件

-- ==========================================
-- 1. sites 表 - user_id 是 UUID 类型
-- ==========================================
DROP POLICY IF EXISTS "Public read" ON sites;
DROP POLICY IF EXISTS "Public insert" ON sites;
DROP POLICY IF EXISTS "Public update" ON sites;
DROP POLICY IF EXISTS "Public delete" ON sites;
DROP POLICY IF EXISTS "Anyone can read public published sites" ON sites;
DROP POLICY IF EXISTS "Users can read own sites" ON sites;
DROP POLICY IF EXISTS "Users can insert own sites" ON sites;
DROP POLICY IF EXISTS "Users can update own sites" ON sites;
DROP POLICY IF EXISTS "Users can delete own sites" ON sites;

CREATE POLICY "Anyone can read public published sites"
  ON sites FOR SELECT
  USING (published = true AND is_public = true);

CREATE POLICY "Users can read own sites"
  ON sites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sites"
  ON sites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sites"
  ON sites FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sites"
  ON sites FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- 2. user_likes 表 - user_id 是 TEXT 类型
-- ==========================================
DROP POLICY IF EXISTS "Users can read own likes" ON user_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON user_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON user_likes;

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
-- 3. user_favorites 表 - user_id 是 TEXT 类型
-- ==========================================
DROP POLICY IF EXISTS "Users can read own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;

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
-- 4. 点赞/收藏原子操作函数
-- ==========================================

CREATE OR REPLACE FUNCTION toggle_like(p_user_id TEXT, p_site_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_liked BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM user_likes WHERE user_id = p_user_id AND site_id = p_site_id) THEN
    DELETE FROM user_likes WHERE user_id = p_user_id AND site_id = p_site_id;
    UPDATE sites SET likes = GREATEST(0, likes - 1) WHERE id = p_site_id;
    v_liked := FALSE;
  ELSE
    INSERT INTO user_likes (user_id, site_id, created_at) VALUES (p_user_id, p_site_id, NOW());
    UPDATE sites SET likes = likes + 1 WHERE id = p_site_id;
    v_liked := TRUE;
  END IF;
  RETURN jsonb_build_object('liked', v_liked);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION toggle_favorite(p_user_id TEXT, p_site_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_favorited BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM user_favorites WHERE user_id = p_user_id AND site_id = p_site_id) THEN
    DELETE FROM user_favorites WHERE user_id = p_user_id AND site_id = p_site_id;
    UPDATE sites SET favorites = GREATEST(0, favorites - 1) WHERE id = p_site_id;
    v_favorited := FALSE;
  ELSE
    INSERT INTO user_favorites (user_id, site_id, created_at) VALUES (p_user_id, p_site_id, NOW());
    UPDATE sites SET favorites = favorites + 1 WHERE id = p_site_id;
    v_favorited := TRUE;
  END IF;
  RETURN jsonb_build_object('favorited', v_favorited);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_views(p_site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sites SET views = views + 1 WHERE id = p_site_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- 5. 添加数据库索引
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON sites(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_published_public ON sites(published, is_public) WHERE published = true AND is_public = true;
CREATE INDEX IF NOT EXISTS idx_sites_created_at ON sites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
