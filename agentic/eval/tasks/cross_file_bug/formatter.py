from data_loader import load_records


def format_report(filepath):
    records = load_records()
    lines = []
    for record in records:
        lines.append(f"{record['name']}: {record['grade']}")
    return "\n".join(lines)
