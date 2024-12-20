---
title: "Mysql 基础命令"
publishedAt: 2023-05-24
description: "初学mysql时常用的命令"
slug: "mysql-command"
isPublish: true
---

# 1. 创建数据库
```sql
CREATE DATABASE IF NOT EXISTS mydatabase;
```

# 2. 删除数据库
```sql
DROP DATABASE IF EXISTS mydatabase;
```

# 3. 创建表
```sql
CREATE TABLE IF NOT EXISTS mytable (
    id INT AUTO_INCREMENT,
    name VARCHAR(100),
    PRIMARY KEY (id)
);
```

# 4. 删除表
```sql
DROP TABLE IF EXISTS mytable;
```

# 5. 插入数据
```sql
INSERT INTO mytable (name) VALUES ('John');
```

# 6. 查询数据
```sql
SELECT * FROM mytable;
```

# 7. 更新数据
```sql
UPDATE mytable SET name = 'Jane' WHERE id = 1;
```

# 8. 删除数据
```sql
DELETE FROM mytable WHERE id = 1;
```


