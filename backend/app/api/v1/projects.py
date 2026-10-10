from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.models import Project, User
from app.schemas.schemas import ProjectCreate, ProjectUpdate, ProjectOut
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
def get_projects(
    search: Optional[str] = None,
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.user_id == current_user.id)
    if search:
        query = query.filter(Project.name.ilike(f"%{search}%") | Project.description.ilike(f"%{search}%") | Project.tags.ilike(f"%{search}%"))
    if language:
        query = query.filter(Project.source_language == language.lower() | Project.target_language == language.lower())
    return query.order_by(Project.updated_at.desc()).all()

@router.post("", response_model=ProjectOut)
def create_project(
    req: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = Project(
        user_id=current_user.id,
        name=req.name.strip(),
        description=req.description,
        source_language=req.source_language.lower(),
        target_language=req.target_language.lower(),
        source_code=req.source_code,
        translated_code=req.translated_code,
        notes=req.notes,
        tags=req.tags
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project

@router.put("/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: str,
    req: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if req.name is not None:
        project.name = req.name.strip()
    if req.description is not None:
        project.description = req.description
    if req.source_language is not None:
        project.source_language = req.source_language.lower()
    if req.target_language is not None:
        project.target_language = req.target_language.lower()
    if req.source_code is not None:
        project.source_code = req.source_code
    if req.translated_code is not None:
        project.translated_code = req.translated_code
    if req.notes is not None:
        project.notes = req.notes
    if req.tags is not None:
        project.tags = req.tags

    db.commit()
    db.refresh(project)
    return project

@router.post("/{project_id}/duplicate", response_model=ProjectOut)
def duplicate_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    original = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Project not found.")

    clone = Project(
        user_id=current_user.id,
        name=f"{original.name} (Copy)",
        description=original.description,
        source_language=original.source_language,
        target_language=original.target_language,
        source_code=original.source_code,
        translated_code=original.translated_code,
        notes=original.notes,
        tags=original.tags
    )
    db.add(clone)
    db.commit()
    db.refresh(clone)
    return clone

@router.delete("/{project_id}")
def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted successfully."}
