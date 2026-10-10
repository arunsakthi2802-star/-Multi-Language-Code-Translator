import re
from typing import Dict, Any, List, Tuple
from app.translators.language_registry import get_language

class RuleBasedTranslationResult:
    def __init__(self, translated_code: str, warnings: List[str], notes: List[str], is_partial: bool = False):
        self.translated_code = translated_code
        self.warnings = warnings
        self.notes = notes
        self.is_partial = is_partial

class RuleBasedTranslationProvider:
    """
    Deterministic rule-based translator for a clearly defined, documented subset of syntax:
    - Python <-> JavaScript
    - Python <-> TypeScript
    - Python -> C
    
    Reports honest warnings and unsupported constructs.
    """

    SUPPORTED_PAIRS = [
        ("python", "javascript"),
        ("javascript", "python"),
        ("python", "typescript"),
        ("typescript", "python"),
        ("python", "c"),
    ]

    @classmethod
    def is_pair_supported(cls, source_lang: str, target_lang: str) -> bool:
        return (source_lang.lower().strip(), target_lang.lower().strip()) in cls.SUPPORTED_PAIRS

    @classmethod
    def translate(cls, source_code: str, source_lang: str, target_lang: str, options: dict) -> RuleBasedTranslationResult:
        s_lang = source_lang.lower().strip()
        t_lang = target_lang.lower().strip()

        if s_lang == "python" and t_lang in ("javascript", "typescript"):
            return cls._python_to_js(source_code, is_ts=(t_lang == "typescript"))
        elif s_lang in ("javascript", "typescript") and t_lang == "python":
            return cls._js_to_python(source_code)
        elif s_lang == "python" and t_lang == "c":
            return cls._python_to_c(source_code)
        else:
            raise ValueError(
                f"Rule-based fallback supports: Python <-> JavaScript/TypeScript and Python -> C for basic constructs. "
                f"For {source_lang} to {target_lang}, please configure an AI provider with active quota or Ollama."
            )

    @classmethod
    def _python_to_js(cls, code: str, is_ts: bool = False) -> RuleBasedTranslationResult:
        warnings = []
        notes = ["Rule-based engine converted basic Python constructs into JavaScript/TypeScript."]
        lines = code.split("\n")
        output_lines = []
        unsupported_count = 0

        if "yield " in code or "async with" in code:
            warnings.append("Generators and async context managers are outside the rule-based subset.")
            unsupported_count += 1

        indent_stack = [0]

        for i, raw_line in enumerate(lines):
            line = raw_line.rstrip()
            stripped = line.strip()

            if not stripped:
                output_lines.append("")
                continue

            # Calculate indentation
            leading_spaces = len(line) - len(line.lstrip(" "))
            indent = " " * leading_spaces

            # Check if block indentation closed
            while len(indent_stack) > 1 and leading_spaces < indent_stack[-1]:
                indent_stack.pop()
                output_lines.append(" " * indent_stack[-1] + "}")

            # 1. Comments
            if stripped.startswith("#"):
                output_lines.append(f"{indent}// {stripped[1:].strip()}")
                continue

            # 2. Print statements
            print_match = re.match(r"^print\s*\((.*)\)$", stripped)
            if print_match:
                arg = print_match.group(1)
                arg = cls._convert_py_expr_to_js(arg)
                output_lines.append(f"{indent}console.log({arg});")
                continue

            # 3. Simple def function
            func_match = re.match(r"^def\s+([a-zA-Z_0-9]+)\s*\((.*?)\)\s*:$", stripped)
            if func_match:
                fname = func_match.group(1)
                args = func_match.group(2)
                output_lines.append(f"{indent}function {fname}({args}) {{")
                indent_stack.append(leading_spaces + 4)
                continue

            # 4. If / elif / else
            if_match = re.match(r"^if\s+(.*)\s*:$", stripped)
            if if_match:
                cond = cls._py_cond_to_js(if_match.group(1))
                output_lines.append(f"{indent}if ({cond}) {{")
                indent_stack.append(leading_spaces + 4)
                continue

            elif_match = re.match(r"^elif\s+(.*)\s*:$", stripped)
            if elif_match:
                cond = cls._py_cond_to_js(elif_match.group(1))
                output_lines.append(f"{indent}}} else if ({cond}) {{")
                continue

            if stripped == "else:":
                output_lines.append(f"{indent}}} else {{")
                continue

            # 5. While loop
            while_match = re.match(r"^while\s+(.*)\s*:$", stripped)
            if while_match:
                cond = cls._py_cond_to_js(while_match.group(1))
                output_lines.append(f"{indent}while ({cond}) {{")
                indent_stack.append(leading_spaces + 4)
                continue

            # 6. For in range loop
            range_match = re.match(r"^for\s+([a-zA-Z_0-9]+)\s+in\s+range\((.*?)\)\s*:$", stripped)
            if range_match:
                var = range_match.group(1)
                range_args = [x.strip() for x in range_match.group(2).split(",")]
                if len(range_args) == 1:
                    output_lines.append(f"{indent}for (let {var} = 0; {var} < {range_args[0]}; {var}++) {{")
                elif len(range_args) == 2:
                    output_lines.append(f"{indent}for (let {var} = {range_args[0]}; {var} < {range_args[1]}; {var}++) {{")
                elif len(range_args) == 3:
                    output_lines.append(f"{indent}for (let {var} = {range_args[0]}; {var} < {range_args[1]}; {var} += {range_args[2]}) {{")
                indent_stack.append(leading_spaces + 4)
                continue

            # 7. For item in list
            for_match = re.match(r"^for\s+([a-zA-Z_0-9]+)\s+in\s+(.*?)\s*:$", stripped)
            if for_match:
                var = for_match.group(1)
                collection = cls._convert_py_expr_to_js(for_match.group(2))
                output_lines.append(f"{indent}for (const {var} of {collection}) {{")
                indent_stack.append(leading_spaces + 4)
                continue

            # 8. Return statement
            ret_match = re.match(r"^return(\s+.*)?$", stripped)
            if ret_match:
                expr = ret_match.group(1) or ""
                expr = cls._convert_py_expr_to_js(expr.strip())
                output_lines.append(f"{indent}return {expr};".replace("return ;", "return;"))
                continue

            # 9. List append: x.append(...) -> x.push(...)
            append_match = re.match(r"^([a-zA-Z_0-9]+)\.append\((.*)\)$", stripped)
            if append_match:
                obj = append_match.group(1)
                item = cls._convert_py_expr_to_js(append_match.group(2))
                output_lines.append(f"{indent}{obj}.push({item});")
                continue

            # 10. Simple Variable assignment
            assign_match = re.match(r"^([a-zA-Z_0-9]+)\s*(=|\+=|-=|\*=|/=|%=)\s*(.*)$", stripped)
            if assign_match:
                var_name = assign_match.group(1)
                op = assign_match.group(2)
                rhs = cls._convert_py_expr_to_js(assign_match.group(3))
                if op == "=":
                    output_lines.append(f"{indent}let {var_name} = {rhs};")
                else:
                    output_lines.append(f"{indent}{var_name} {op} {rhs};")
                continue

            # Fallback line
            unsupported_count += 1
            cleaned = cls._convert_py_expr_to_js(stripped)
            output_lines.append(f"{indent}{cleaned};")

        while len(indent_stack) > 1:
            indent_stack.pop()
            output_lines.append(" " * indent_stack[-1] + "}")

        if unsupported_count > 0:
            warnings.append(f"{unsupported_count} statement(s) converted via general syntax mapping. Review target code.")

        translated = "\n".join(output_lines)
        return RuleBasedTranslationResult(
            translated_code=translated,
            warnings=warnings,
            notes=notes,
            is_partial=(unsupported_count > 0)
        )

    @classmethod
    def _convert_py_expr_to_js(cls, expr: str) -> str:
        res = expr
        res = re.sub(r"\bTrue\b", "true", res)
        res = re.sub(r"\bFalse\b", "false", res)
        res = re.sub(r"\bNone\b", "null", res)
        # len(x) -> x.length
        res = re.sub(r"\blen\((.*?)\)", r"\1.length", res)
        return res

    @classmethod
    def _py_cond_to_js(cls, cond: str) -> str:
        res = cls._convert_py_expr_to_js(cond)
        res = re.sub(r"\band\b", "&&", res)
        res = re.sub(r"\bor\b", "||", res)
        res = re.sub(r"\bnot\b", "!", res)
        res = res.replace(" == ", " === ")
        res = res.replace(" != ", " !== ")
        return res

    @classmethod
    def _js_to_python(cls, code: str) -> RuleBasedTranslationResult:
        warnings = []
        notes = ["Rule-based engine converted basic JavaScript/TypeScript constructs into Python."]
        lines = code.split("\n")
        output_lines = []

        indent_level = 0

        for line in lines:
            stripped = line.strip()
            if not stripped:
                output_lines.append("")
                continue

            # Comments
            if stripped.startswith("//"):
                output_lines.append("    " * indent_level + "# " + stripped[2:].strip())
                continue

            # Closing brace
            if stripped.startswith("}"):
                indent_level = max(0, indent_level - 1)
                if stripped == "}":
                    continue

            cur_indent = "    " * indent_level

            # console.log
            console_match = re.match(r"^console\.log\((.*)\);?$", stripped)
            if console_match:
                arg = cls._convert_js_expr_to_py(console_match.group(1))
                output_lines.append(f"{cur_indent}print({arg})")
                continue

            # function def
            fn_match = re.match(r"^function\s+([a-zA-Z_0-9]+)\s*\((.*?)\)\s*\{?$", stripped)
            if fn_match:
                output_lines.append(f"{cur_indent}def {fn_match.group(1)}({fn_match.group(2)}):")
                indent_level += 1
                continue

            # if statement
            if_match = re.match(r"^if\s*\((.*)\)\s*\{?$", stripped)
            if if_match:
                cond = cls._convert_js_expr_to_py(if_match.group(1))
                cond = re.sub(r"&&", "and", cond)
                cond = re.sub(r"\|\|", "or", cond)
                cond = re.sub(r"===", "==", cond)
                cond = re.sub(r"!==", "!=", cond)
                output_lines.append(f"{cur_indent}if {cond}:")
                indent_level += 1
                continue

            # array push: x.push(...) -> x.append(...)
            push_match = re.match(r"^([a-zA-Z_0-9]+)\.push\((.*)\);?$", stripped)
            if push_match:
                obj = push_match.group(1)
                item = cls._convert_js_expr_to_py(push_match.group(2))
                output_lines.append(f"{cur_indent}{obj}.append({item})")
                continue

            # let/const/var assignment
            let_match = re.match(r"^(?:let|const|var)\s+([a-zA-Z_0-9]+)\s*=\s*(.*?);?$", stripped)
            if let_match:
                var = let_match.group(1)
                val = cls._convert_js_expr_to_py(let_match.group(2))
                output_lines.append(f"{cur_indent}{var} = {val}")
                continue

            # return
            ret_match = re.match(r"^return\s*(.*?);?$", stripped)
            if ret_match:
                val = cls._convert_js_expr_to_py(ret_match.group(1))
                output_lines.append(f"{cur_indent}return {val}".strip())
                continue

            cleaned = cls._convert_js_expr_to_py(stripped.rstrip(";"))
            output_lines.append(f"{cur_indent}{cleaned}")

        return RuleBasedTranslationResult(
            translated_code="\n".join(output_lines),
            warnings=warnings,
            notes=notes,
            is_partial=False
        )

    @classmethod
    def _convert_js_expr_to_py(cls, expr: str) -> str:
        res = expr
        res = re.sub(r"\btrue\b", "True", res)
        res = re.sub(r"\bfalse\b", "False", res)
        res = re.sub(r"\bnull\b", "None", res)
        res = re.sub(r"\bundefined\b", "None", res)
        res = re.sub(r"([a-zA-Z_0-9]+)\.length", r"len(\1)", res)
        return res

    @classmethod
    def _python_to_c(cls, code: str) -> RuleBasedTranslationResult:
        warnings = ["C requires strict manual memory management and type specifications."]
        notes = ["Wrapped converted Python statements inside standard C main() routine."]
        lines = code.split("\n")
        body_lines = []

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("#"):
                body_lines.append(f"    // {stripped[1:].strip()}")
                continue
            p_match = re.match(r"^print\s*\((.*)\)$", stripped)
            if p_match:
                arg = p_match.group(1)
                if arg.startswith('"') or arg.startswith("'"):
                    val = arg.strip("\"'")
                    body_lines.append(f'    printf("{val}\\n");')
                else:
                    body_lines.append(f'    printf("%d\\n", {arg});')
                continue
            # Simple integer assignment
            assign_match = re.match(r"^([a-zA-Z_0-9]+)\s*=\s*(\d+)$", stripped)
            if assign_match:
                body_lines.append(f'    int {assign_match.group(1)} = {assign_match.group(2)};')
                continue
            body_lines.append(f'    // {stripped}')

        c_program = [
            "#include <stdio.h>",
            "",
            "int main() {",
            *body_lines,
            "    return 0;",
            "}"
        ]

        return RuleBasedTranslationResult(
            translated_code="\n".join(c_program),
            warnings=warnings,
            notes=notes,
            is_partial=True
        )
