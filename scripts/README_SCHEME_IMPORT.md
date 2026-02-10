# Scheme Import: Excel → SQL

Bulk-import scheme data from an **Excel workbook** (.xlsx). The Python script reads the **active sheet**; the **first row must be the header** and each following row is one scheme. It generates `INSERT` statements for `public.schemes`.

## Excel Sheet Format

Use **one sheet** (the active sheet is used). **First row = header.** One data row per scheme.

| Column name (exact) | Required | Description |
|---------------------|----------|-------------|
| **Name** | Yes | Scheme name (e.g. PMEGP, MUDRA Shishu) |
| **Type** | Yes | One of: `loan`, `subsidy`, `grant` |
| **Benefit Summary** | Yes | Short description of benefits |
| **Key Benefit Display** | No | One-line highlight (e.g. "Up to ₹50L") |
| **States** | No | `*` for all states, or comma-separated (e.g. Maharashtra, Gujarat) |
| **Required Documents** | No | Semicolon-separated list (e.g. ID proof; Business plan; Bank statement) |
| **Estimated Timeline** | No | e.g. "4–6 weeks from application" |
| **Business Types** | No | Comma-separated: `micro`, `small`, `medium`, `startup` |
| **Industries** | No | Comma-separated (e.g. Manufacturing, Services) |
| **Turnover Max** | No | Max turnover in lakhs (number) |
| **Turnover Min** | No | Min turnover in lakhs (number) |
| **Company Age Max** | No | Max company age in years (number) |
| **Company Age Min** | No | Min company age in years (number) |
| **Funding Types** | No | Comma-separated: `loan`, `subsidy`, `grant` |

- Empty cells are treated as “not set” (no restriction for eligibility).
- Column names are case-insensitive but spelling must match.

## Template

To get an Excel file with the correct columns and one example row:

```bash
python create_sample_excel.py schemes_template.xlsx
```

Open `schemes_template.xlsx`, add your scheme rows, then run the SQL generator below.

## Setup

```bash
cd scripts
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

```bash
python excel_to_schemes_sql.py path/to/schemes.xlsx
```

Output is printed to stdout. Redirect to a file and run in Supabase SQL Editor (or via `psql`):

```bash
python excel_to_schemes_sql.py schemes.xlsx > supabase/seed_schemes.sql
```

Then run `seed_schemes.sql` in the Supabase SQL Editor (or `psql` against your DB). To avoid duplicates, ensure scheme names in the Excel sheet are unique or run the SQL against a fresh/empty schemes table.
