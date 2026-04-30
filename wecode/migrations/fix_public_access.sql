-- 修复公共访问策略
-- 在 Supabase SQL Editor 中执行

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Public read" ON sites;
DROP POLICY IF EXISTS "Anyone can read public published sites" ON sites;

-- 允许所有人读取已发布的网站（不限制 is_public）
CREATE POLICY "Anyone can read published sites"
  ON sites FOR SELECT
  USING (published = true);

-- 或者更宽松：允许所有人读取所有网站（用于调试）
-- CREATE POLICY "Allow all reads" ON sites FOR SELECT USING (true);
