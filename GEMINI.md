# Gemini Code Assist Memos

이 파일은 Gemini Code Assist와의 상호작용을 통해 얻은 프로젝트 관련 정보, 결정 사항, 유용한 팁 등을 기록하는 공간입니다.

# 절대 반드시 지켜야만 하는 절대적 원칙 (안지키면 다시해야함)

- 코드의 동작이나 구현이 바뀌면 안되고 반드시 구조 변경(리팩토링)만 해야해야만해
- 공통으로 쓰이는 파일만 공통 폴더에 넣어두고, 비즈니스 로직이 담긴 경우, 관심사끼리 묶어 폴더로 관리해야해
- src/basic/tests/basic.test.js, src/advanced/tests/advanced.test.js 테스트 코드가 모두 하나도 빠짐없이 통과해야해 (테스트는 npx vitest run 으로 watch 가 발생하지 않도록 해)
- 테스트 코드 검증 여부는 main.basic.js 를 기준으로 검사해야만해. origin 파일은 의미없어.

-> 결과파일은 main.basic.js 에 적용해줘
-> 작업 후 마지막으로 절대 원칙이 지켜졌는지 한번 더 컴토 후 올바르게 고치고 알려줘

# Clean Code Writing Rules

## MANDATORY CODE WRITING RULES

You MUST follow these rules when writing any code:

### CORE DESIGN PRINCIPLES

- **DRY**: NEVER repeat the same code
- **KISS**: Write code as simply as possible
- **YAGNI**: Do NOT write unnecessary code
- **Single Responsibility**: Functions MUST be under 20 lines and have ONE clear responsibility

### CODE ORGANIZATION RULES

Apply these 4 organization principles:

- **Proximity**: Group related elements with blank lines
- **Commonality**: Group related functionality into functions
- **Similarity**: Use similar names and positions for similar roles
- **Continuity**: Arrange code in dependency order

### NAMING REQUIREMENTS

#### Naming Principles (ALL MUST BE FOLLOWED)

1. **Predictable**: Name must allow prediction of value, type, and return value
2. **Contextual**: Add descriptive adjectives or nouns for context
3. **Clear**: Remove unnecessary words while maintaining clear meaning
4. **Concise**: Brief yet clearly convey role and purpose
5. **Consistent**: Use identical terms for identical intentions across entire codebase

#### REQUIRED Naming Patterns

**Action Functions - USE THESE PATTERNS:**

```
// Creation: create~(), add~(), push~(), insert~(), new~(), append~(), spawn~(), make~(), build~(), generate~()
// Retrieval: get~(), fetch~(), query~()
// Transformation: parse~(), split~(), transform~(), serialize~()
// Modification: update~(), mutation~()
// Deletion: delete~(), remove~()
// Communication: put~(), send~(), dispatch~(), receive~()
// Validation: validate~(), check~()
// Calculation: calc~(), compute~()
// Control: init~(), configure~(), start~(), stop~()
// Storage: save~(), store~()
// Logging: log~(), record~()
```

**Data Variables - USE THESE PATTERNS:**

```
// Quantities: count~, sum~, num~, min~, max~, total
// State: is~, has~, current~, selected~
// Progressive/Past: ~ing, ~ed
// Information: ~name, ~title, ~desc, ~text, ~data
// Identifiers: ~ID, ~code, ~index, ~key
// Time: ~at, ~date
// Type: ~type
// Collections: ~s
// Others: item, temp, params, error
// Conversion: from(), of()
```

### ABSTRACTION RULES

- **Data Abstraction**: Simplify data structure and processing methods
- **Process Abstraction**: Encapsulate complex logic into simple interfaces
- **Appropriate Level**: Do NOT over-abstract or under-abstract

### MANDATORY CHECKLIST

Before finalizing ANY code, you MUST verify:

1. ✅ **Applied standard naming patterns** from above
2. ✅ **Organized code using 4 organization principles**
3. ✅ **Split complex logic into small functions**
4. ✅ **Code expresses intent without comments** (comments only when absolutely necessary)
5. ✅ **Maintained consistent formatting**

### FORBIDDEN PRACTICES

- ❌ Do NOT mix similar terms (`display` vs `show`)
- ❌ Do NOT write functions longer than 20 lines
- ❌ Do NOT repeat code patterns
- ❌ Do NOT use unclear or ambiguous names
- ❌ Do NOT violate naming consistency across codebase

## COMPLIANCE REQUIREMENT

ALL code output MUST comply with these rules. No exceptions.
