import difflib
from typing import Dict, Any, List
from pydantic import BaseModel

class DiffLine(BaseModel):
    type: str # 'added', 'removed', 'modified', 'unchanged'
    old_line_no: int | None = None
    new_line_no: int | None = None
    content: str

class ComparisonResult(BaseModel):
    source_language: str
    target_language: str
    diff_lines: List[DiffLine]
    unified_diff: str
    stats: Dict[str, int]
    ai_assessment: Dict[str, Any] | None = None

class ComparisonService:
    @classmethod
    def compare_code(
        cls,
        source_code: str,
        source_lang: str,
        target_code: str,
        target_lang: str,
        ai_assessment: Dict[str, Any] | None = None
    ) -> ComparisonResult:
        source_lines = source_code.splitlines()
        target_lines = target_code.splitlines()

        matcher = difflib.SequenceMatcher(None, source_lines, target_lines)
        diff_lines: List[DiffLine] = []

        added = 0
        removed = 0
        unchanged = 0

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                for k in range(i2 - i1):
                    diff_lines.append(DiffLine(
                        type='unchanged',
                        old_line_no=i1 + k + 1,
                        new_line_no=j1 + k + 1,
                        content=source_lines[i1 + k]
                    ))
                    unchanged += 1
            elif tag == 'replace':
                for k in range(i1, i2):
                    diff_lines.append(DiffLine(
                        type='removed',
                        old_line_no=k + 1,
                        new_line_no=None,
                        content=source_lines[k]
                    ))
                    removed += 1
                for k in range(j1, j2):
                    diff_lines.append(DiffLine(
                        type='added',
                        old_line_no=None,
                        new_line_no=k + 1,
                        content=target_lines[k]
                    ))
                    added += 1
            elif tag == 'delete':
                for k in range(i1, i2):
                    diff_lines.append(DiffLine(
                        type='removed',
                        old_line_no=k + 1,
                        new_line_no=None,
                        content=source_lines[k]
                    ))
                    removed += 1
            elif tag == 'insert':
                for k in range(j1, j2):
                    diff_lines.append(DiffLine(
                        type='added',
                        old_line_no=None,
                        new_line_no=k + 1,
                        content=target_lines[k]
                    ))
                    added += 1

        unified = "\n".join(difflib.unified_diff(
            source_lines,
            target_lines,
            fromfile=f"source.{source_lang}",
            tofile=f"target.{target_lang}",
            lineterm=""
        ))

        return ComparisonResult(
            source_language=source_lang,
            target_language=target_lang,
            diff_lines=diff_lines,
            unified_diff=unified,
            stats={
                "added": added,
                "removed": removed,
                "unchanged": unchanged,
                "total_source_lines": len(source_lines),
                "total_target_lines": len(target_lines)
            },
            ai_assessment=ai_assessment
        )
