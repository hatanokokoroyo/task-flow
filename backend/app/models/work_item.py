from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class WorkItem(Base):
    __tablename__ = "work_items"

    id = Column(Integer, primary_key=True, index=True)
    parent_id = Column(Integer, ForeignKey("work_items.id"), nullable=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    status = Column(String, nullable=False)  # TODO, DESIGN, DEV, TEST, DEPLOY, DONE
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    # Self-referential relationship for nested tasks
    children = relationship("WorkItem", backref="parent", remote_side=[id])
    comments = relationship("Comment", back_populates="work_item", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="work_item", cascade="all, delete-orphan")

    @property
    def comment_count(self) -> int:
        return len(self.comments)

    @property
    def total_children(self) -> int:
        return len([c for c in self.children if not c.is_deleted])

    @property
    def completed_children(self) -> int:
        return len([c for c in self.children if not c.is_deleted and c.status.upper() == 'DONE'])

    @property
    def progress_percentage(self) -> float:
        total = self.total_children
        if total == 0:
            return 100.0 if self.status.upper() == 'DONE' else 0.0
        return round((self.completed_children / total) * 100, 2)
