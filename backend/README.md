# Task Flow Backend

基于 FastAPI + SQLite 3 构建的轻量级工作日志系统后端。

## 技术栈
- **框架**: FastAPI
- **数据库**: SQLite 3
- **ORM**: SQLAlchemy 2.0
- **验证**: Pydantic v2

## 目录结构
- `app/main.py`: 应用入口，自动创建数据库表。
- `app/api/`: API 接口定义。
- `app/models/`: SQLAlchemy 数据库模型。
- `app/schemas/`: Pydantic 数据验证模型。
- `app/services/`: 业务逻辑封装（包含自动生成日志逻辑）。
- `app/crud/`: 基础数据库 CRUD 操作。
- `app/core/`: 核心配置。

## 运行说明
1. 确保已安装 Python 3.9+。
2. 安装依赖:
   ```bash
   pip install -r requirements.txt
   ```
3. 启动服务:
   ```bash
   uvicorn app.main:app --reload
   ```
4. API 文档:
   访问 `http://127.0.0.1:8000/docs` 查看 Swagger 文档。

## 数据库
数据库文件保存在 `backend/data/task_flow.db`。首次运行会自动创建。
