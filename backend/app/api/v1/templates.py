from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.schemas.schemas import TemplateOut

router = APIRouter(prefix="/templates", tags=["Templates"])

DEFAULT_TEMPLATES = [
    {
        "id": "tpl-hello-world-py",
        "title": "Hello World & Greeting",
        "description": "Standard entry point program demonstrating standard output and string interpolation.",
        "source_language": "python",
        "code": 'def main():\n    name = "World"\n    print(f"Hello, {name}!")\n\nif __name__ == "__main__":\n    main()',
        "difficulty": "Beginner",
        "category": "Basics",
        "expected_behavior": 'Prints "Hello, World!" to console.',
        "is_public": True
    },
    {
        "id": "tpl-vars-math-py",
        "title": "Variables & Arithmetic Operations",
        "description": "Variable assignments, integer, float, and modulo mathematical operations.",
        "source_language": "python",
        "code": 'def calculate_metrics(a, b):\n    addition = a + b\n    subtraction = a - b\n    product = a * b\n    quotient = a / b if b != 0 else 0\n    remainder = a % b if b != 0 else 0\n    return {\n        "sum": addition,\n        "diff": subtraction,\n        "prod": product,\n        "div": quotient,\n        "mod": remainder\n    }\n\nres = calculate_metrics(15, 4)\nprint(res)',
        "difficulty": "Beginner",
        "category": "Basics",
        "expected_behavior": "Computes arithmetic operations and returns a dictionary of results.",
        "is_public": True
    },
    {
        "id": "tpl-if-else-js",
        "title": "Conditional Branching & Grading",
        "description": "If-else conditionals evaluating score thresholds and returning letter grades.",
        "source_language": "javascript",
        "code": 'function getGrade(score) {\n    if (score >= 90) {\n        return "A";\n    } else if (score >= 80) {\n        return "B";\n    } else if (score >= 70) {\n        return "C";\n    } else if (score >= 60) {\n        return "D";\n    } else {\n        return "F";\n    }\n}\n\nconsole.log(getGrade(85));',
        "difficulty": "Beginner",
        "category": "Control Flow",
        "expected_behavior": 'Returns "B" for score 85.',
        "is_public": True
    },
    {
        "id": "tpl-fib-recursion-py",
        "title": "Recursive Fibonacci with Memoization",
        "description": "Calculates the Nth Fibonacci number using recursion and memoization cache.",
        "source_language": "python",
        "code": 'memo = {}\n\ndef fibonacci(n):\n    if n <= 0:\n        return 0\n    if n == 1:\n        return 1\n    if n in memo:\n        return memo[n]\n    \n    memo[n] = fibonacci(n - 1) + fibonacci(n - 2)\n    return memo[n]\n\nprint("Fibonacci(10):", fibonacci(10))',
        "difficulty": "Intermediate",
        "category": "Algorithms",
        "expected_behavior": "Calculates Fibonacci(10) = 55 efficiently.",
        "is_public": True
    },
    {
        "id": "tpl-binary-search-py",
        "title": "Binary Search Algorithm",
        "description": "Classic O(log N) binary search on a sorted integer list.",
        "source_language": "python",
        "code": 'def binary_search(arr, target):\n    low = 0\n    high = len(arr) - 1\n    \n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n            \n    return -1\n\nnumbers = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\nidx = binary_search(numbers, 23)\nprint(f"Target found at index: {idx}")',
        "difficulty": "Intermediate",
        "category": "Algorithms",
        "expected_behavior": "Returns index 5 for target 23.",
        "is_public": True
    },
    {
        "id": "tpl-bubble-sort-js",
        "title": "Bubble Sort Algorithm",
        "description": "In-place comparison sorting algorithm with pass counters.",
        "source_language": "javascript",
        "code": 'function bubbleSort(arr) {\n    const n = arr.length;\n    let swapped;\n    do {\n        swapped = false;\n        for (let i = 0; i < n - 1; i++) {\n            if (arr[i] > arr[i + 1]) {\n                const temp = arr[i];\n                arr[i] = arr[i + 1];\n                arr[i + 1] = temp;\n                swapped = true;\n            }\n        }\n    } while (swapped);\n    return arr;\n}\n\nconst sample = [64, 34, 25, 12, 22, 11, 90];\nconsole.log(bubbleSort(sample));',
        "difficulty": "Intermediate",
        "category": "Algorithms",
        "expected_behavior": "Returns [11, 12, 22, 25, 34, 64, 90].",
        "is_public": True
    },
    {
        "id": "tpl-oop-bank-account-py",
        "title": "OOP: Bank Account Class",
        "description": "Object-oriented class with encapsulation, deposits, withdrawals, and balance inquiries.",
        "source_language": "python",
        "code": 'class BankAccount:\n    def __init__(self, owner, balance=0.0):\n        self.owner = owner\n        self._balance = balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError("Deposit must be positive")\n        self._balance += amount\n        return self._balance\n\n    def withdraw(self, amount):\n        if amount > self._balance:\n            raise ValueError("Insufficient funds")\n        self._balance -= amount\n        return self._balance\n\n    def get_balance(self):\n        return self._balance\n\naccount = BankAccount("Alice", 100.0)\naccount.deposit(50.0)\naccount.withdraw(30.0)\nprint(f"Balance: {account.get_balance()}")',
        "difficulty": "Intermediate",
        "category": "OOP",
        "expected_behavior": "Encapsulates balance operations and prints 120.0.",
        "is_public": True
    },
    {
        "id": "tpl-sql-queries",
        "title": "SQL Aggregate & Join Query",
        "description": "Relational query joining customers and orders with grouping and aggregation.",
        "source_language": "sql",
        "code": 'SELECT \n    c.customer_id,\n    c.first_name,\n    c.last_name,\n    COUNT(o.order_id) AS total_orders,\n    SUM(o.total_amount) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_date >= \'2025-01-01\'\nGROUP BY c.customer_id, c.first_name, c.last_name\nHAVING SUM(o.total_amount) > 500\nORDER BY total_spent DESC;\n',
        "difficulty": "Intermediate",
        "category": "Database",
        "expected_behavior": "Aggregates customer spend with filter thresholds.",
        "is_public": True
    }
]

@router.get("", response_model=List[TemplateOut])
def list_templates(
    category: Optional[str] = None,
    language: Optional[str] = None,
    difficulty: Optional[str] = None
):
    results = DEFAULT_TEMPLATES
    if category:
        results = [t for t in results if t["category"].lower() == category.lower()]
    if language:
        results = [t for t in results if t["source_language"].lower() == language.lower()]
    if difficulty:
        results = [t for t in results if t["difficulty"].lower() == difficulty.lower()]
    return results

@router.get("/{template_id}", response_model=TemplateOut)
def get_template(template_id: str):
    for t in DEFAULT_TEMPLATES:
        if t["id"] == template_id:
            return t
    raise HTTPException(status_code=404, detail="Template not found.")
