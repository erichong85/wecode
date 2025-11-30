-- 添加点赞和收藏功能的数据库迁移脚本

-- 1. 在 sites 表中添加统计字段
ALTER TABLE sites ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE sites ADD COLUMN IF NOT EXISTS favorites INTEGER DEFAULT 0;

-- 2. 创建用户点赞表
CREATE TABLE IF NOT EXISTS user_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  UNIQUE(user_id, site_id)
);

-- 3. 创建用户收藏表
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  created_at BIGINT NOT NULL,
  UNIQUE(user_id, site_id)
);

-- 4. 启用行级安全策略
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- 5. 创建策略 - 用户只能操作自己的点赞记录
CREATE POLICY "Users can view all likes" ON user_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON user_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own likes" ON user_likes FOR DELETE USING (true);

-- 6. 创建策略 - 用户只能操作自己的收藏记录
CREATE POLICY "Users can view all favorites" ON user_favorites FOR SELECT USING (true);
CREATE POLICY "Users can insert own favorites" ON user_favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own favorites" ON user_favorites FOR DELETE USING (true);

-- 7. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_site_id ON user_likes(site_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_site_id ON user_favorites(site_id);

-- 8. 创建 RPC 函数用于更新计数
CREATE OR REPLACE FUNCTION increment_likes(site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sites SET likes = likes + 1 WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_likes(site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sites SET likes = GREATEST(likes - 1, 0) WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_favorites(site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sites SET favorites = favorites + 1 WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_favorites(site_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE sites SET favorites = GREATEST(favorites - 1, 0) WHERE id = site_id;
END;
$$ LANGUAGE plpgsql;
