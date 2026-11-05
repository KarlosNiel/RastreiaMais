def render_soap_html(report: dict, professional_name: str = "") -> str:
    """
    Gera um documento HTML completo e estilizado para visualização e impressão (PDF)
    do relatório clínico SOAP, com cabeçalho oficial da UBS, assinatura e @media print.
    """
    paciente = report.get("paciente", {})
    subjetivo = report.get("subjetivo", {})
    objetivo = report.get("objetivo", {})
    avaliacao = report.get("avaliacao", {})
    plano = report.get("plano", {})
    indicadores = report.get("indicadores_previne", [])
    gerado_em = report.get("gerado_em", "")

    # Monta linhas de indicadores
    indicadores_html = "".join(
        f"""
        <tr>
            <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">{ind.get('indicador', '')}</td>
            <td style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: {'#16a34a' if ind.get('status') == 'ATINGIDO' else '#ca8a04' if ind.get('status') == 'EM CURSO' else '#dc2626'};">
                {ind.get('status', '')}
            </td>
        </tr>
        """
        for ind in indicadores
    )

    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Clínico SOAP - {paciente.get('nome', 'Paciente')}</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 24px;
            background-color: #f8fafc;
        }}
        .container {{
            max-width: 850px;
            margin: 0 auto;
            background: #ffffff;
            padding: 32px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #0284c7;
            padding-bottom: 16px;
            margin-bottom: 24px;
        }}
        .header h1 {{
            font-size: 20px;
            text-transform: uppercase;
            color: #0f172a;
            margin: 0 0 4px 0;
        }}
        .header h2 {{
            font-size: 14px;
            color: #64748b;
            font-weight: normal;
            margin: 0;
        }}
        .meta-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            background: #f1f5f9;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 24px;
            font-size: 13px;
        }}
        .meta-grid div strong {{
            display: block;
            color: #475569;
            font-size: 11px;
            text-transform: uppercase;
        }}
        .section {{
            margin-bottom: 20px;
        }}
        .section-title {{
            font-size: 15px;
            font-weight: 700;
            color: #0369a1;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 8px;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 6px;
        }}
        .section-content {{
            font-size: 13.5px;
            color: #334155;
            white-space: pre-line;
            background: #fafafa;
            border-left: 3px solid #0284c7;
            padding: 10px 14px;
            border-radius: 0 4px 4px 0;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 8px;
        }}
        th {{
            background: #f8fafc;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 2px solid #cbd5e1;
            color: #475569;
            font-size: 11px;
            text-transform: uppercase;
        }}
        .signature-area {{
            margin-top: 48px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }}
        .signature-box {{
            width: 45%;
            text-align: center;
            border-top: 1px solid #94a3b8;
            padding-top: 8px;
            font-size: 12px;
            color: #475569;
        }}
        @media print {{
            body {{
                background: #ffffff;
                padding: 0;
            }}
            .container {{
                border: none;
                box-shadow: none;
                padding: 0;
                max-width: 100%;
            }}
            .no-print {{
                display: none;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="no-print" style="margin-bottom: 16px; text-align: right;">
            <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">
                🖨️ Imprimir / Salvar PDF
            </button>
        </div>

        <div class="header">
            <h1>Sistema Rastreia+ • Atenção Primária à Saúde</h1>
            <h2>Prontuário Clínico Eletrônico Integrado (Método SOAP)</h2>
        </div>

        <div class="meta-grid">
            <div>
                <strong>Paciente</strong>
                {paciente.get('nome', 'N/D')}
            </div>
            <div>
                <strong>CPF</strong>
                {paciente.get('cpf', 'N/D')}
            </div>
            <div>
                <strong>Nascimento / Idade</strong>
                {paciente.get('nascimento', 'N/D')} ({paciente.get('idade', 'N/D')} anos)
            </div>
            <div>
                <strong>Data de Emissão</strong>
                {gerado_em}
            </div>
        </div>

        <div class="section">
            <div class="section-title">S — Subjetivo (Queixas e Hábitos de Vida)</div>
            <div class="section-content">{subjetivo.get('relato_clinico', 'Sem queixas registradas.')}</div>
        </div>

        <div class="section">
            <div class="section-title">O — Objetivo (Dados Físicos e Exames Laboratoriais)</div>
            <div class="section-content">{objetivo.get('dados_antropometricos_e_exames', 'Sem dados objetivos registrados.')}</div>
        </div>

        <div class="section">
            <div class="section-title">A — Avaliação (Diagnóstico e Estratificação de Risco)</div>
            <div class="section-content">{avaliacao.get('diagnostico_e_risco', 'Avaliação pendente.')}</div>
        </div>

        <div class="section">
            <div class="section-title">P — Plano (Conduta Terapêutica e Encaminhamentos)</div>
            <div class="section-content">{plano.get('conduta_e_plano', 'Conduta a definir.')}</div>
        </div>

        <div class="section">
            <div class="section-title">Indicadores Previne Brasil</div>
            <table>
                <thead>
                    <tr>
                        <th>Indicador Monitorado</th>
                        <th style="width: 120px;">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {indicadores_html}
                </tbody>
            </table>
        </div>

        <div class="signature-area">
            <div class="signature-box">
                Assinatura do Paciente ou Responsável
            </div>
            <div class="signature-box">
                {professional_name or 'Profissional de Saúde'}<br>
                Carimbo / Registro Profissional
            </div>
        </div>
    </div>
</body>
</html>
"""

