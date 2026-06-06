import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

// Função auxiliar para formatar moeda em PT-BR
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

// Função auxiliar para formatar data em PT-BR
const formatDate = (dateString) => {
  if (!dateString) return 'A definir';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

// Cores da marca Celebrate
const COLORS = {
  salmon: [255, 126, 103],    // #FF7E67
  darkNavy: [26, 26, 46],      // #1a1a2e
  gold: [212, 175, 55],        // #D4AF37
  lightGray: [248, 249, 250],  // #f8f9fa
  green: [16, 185, 129],       // #10b981
  red: [239, 68, 68],          // #ef4444
  amber: [245, 158, 11],       // #f59e0b
  textDark: [50, 50, 50],
  textMuted: [120, 120, 120]
};

// Adiciona cabeçalho elegante padrão em cada página
const drawPageHeader = (doc, title, party) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Faixa superior com degrade / cor principal
  doc.setFillColor(...COLORS.darkNavy);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Detalhe salmão abaixo da faixa
  doc.setFillColor(...COLORS.salmon);
  doc.rect(0, 40, pageWidth, 3, 'F');

  // Nome do App (Celebrate) no canto direito
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('Celebrate', pageWidth - 45, 26);
  
  // Ponto salmão no logo Celebrate
  doc.setFillColor(...COLORS.salmon);
  doc.circle(pageWidth - 11, 22, 2.5, 'F');

  // Título do Relatório no canto esquerdo
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), 15, 20);

  // Nome do Evento no canto esquerdo (menor)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(220, 220, 220);
  const partyDetails = `${party.name}  |  Data: ${formatDate(party.date)}  |  Local: ${party.location || 'A definir'}`;
  doc.text(partyDetails, 15, 30);
};

// Adiciona rodapé padrão em cada página
const drawPageFooter = (doc, pageNum, totalPages) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;

  // Linha divisória
  doc.setDrawColor(230, 230, 230);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  // Texto
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textMuted);
  
  const today = new Date().toLocaleString('pt-BR');
  doc.text(`Gerado em ${today} - Celebrate Festas`, 15, pageHeight - 12);
  doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - 35, pageHeight - 12);
};

// Aplica cabeçalho e rodapé em todas as páginas após a geração das tabelas
const applyHeaderFooterToAllPages = (doc, title, party) => {
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageHeader(doc, title, party);
    drawPageFooter(doc, i, totalPages);
  }
};

export const ReportPDFGenerator = {
  // 1. RELATÓRIO DE CONVIDADOS
  async generateGuestListPDF(party, guestsList) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;

    // Estatísticas da lista
    const totalGuests = guestsList.length;
    const confirmed = guestsList.filter(g => g.status === 'confirmed').length;
    const pending = guestsList.filter(g => g.status === 'pending').length;
    const declined = guestsList.filter(g => g.status === 'declined').length;
    
    // Total de confirmados incluindo acompanhantes declarados no RSVP
    // g.companions é o número máximo permitido, mas g.companionNames.length é a quantidade real confirmada
    const companionsConfirmedCount = guestsList
      .filter(g => g.status === 'confirmed' && g.companionNames)
      .reduce((sum, g) => sum + g.companionNames.length, 0);
    
    const totalPresenceConfirmed = confirmed + companionsConfirmedCount;

    // Desenhar Cards de Resumo no Topo (Reserva espaço de Y: 50 a Y: 80)
    const cardWidth = (pageWidth - 30 - 8) / 3; // 3 colunas de cards
    const startY = 53;

    // Card 1: Total de Convites
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(15, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.darkNavy);
    doc.text(String(totalGuests), 20, startY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('TOTAL DE CONVITES', 20, startY + 16);

    // Card 2: Confirmados (Titular + Acompanhantes)
    doc.setFillColor(240, 253, 244); // Verde claro bg
    doc.roundedRect(15 + cardWidth + 4, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.green);
    doc.text(`${totalPresenceConfirmed} confirmados`, 15 + cardWidth + 9, startY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`(${confirmed} convites + ${companionsConfirmedCount} ac.)`, 15 + cardWidth + 9, startY + 16);

    // Card 3: Pendentes / Recusados
    doc.setFillColor(254, 243, 199); // Ambar claro bg
    doc.roundedRect(15 + (cardWidth * 2) + 8, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.amber);
    doc.text(`${pending} pendentes`, 15 + (cardWidth * 2) + 13, startY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`${declined} recusaram o convite`, 15 + (cardWidth * 2) + 13, startY + 16);

    // Tabela de Convidados
    const tableHeaders = [['#', 'Nome Completo', 'Telefone', 'Status', 'Acompanhantes Confirmados']];
    const tableRows = guestsList.map((g, index) => {
      const companionNamesStr = g.companionNames && g.companionNames.length > 0
        ? g.companionNames.join(', ')
        : 'Nenhum';
      
      let statusLabel = 'Pendente';
      if (g.status === 'confirmed') statusLabel = 'Confirmado';
      if (g.status === 'declined') statusLabel = 'Recusado';

      return [
        index + 1,
        g.name,
        g.phone || '-',
        statusLabel,
        companionNamesStr
      ];
    });

    autoTable(doc, {
      startY: startY + 30,
      head: tableHeaders,
      body: tableRows,
      margin: { left: 15, right: 15, top: 48, bottom: 25 },
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.darkNavy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50, fontStyle: 'bold' },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 },
        4: { cellWidth: 60 }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 3) {
          const status = data.cell.raw;
          if (status === 'Confirmado') {
            data.cell.styles.textColor = COLORS.green;
            data.cell.styles.fontStyle = 'bold';
          } else if (status === 'Recusado') {
            data.cell.styles.textColor = COLORS.red;
          } else {
            data.cell.styles.textColor = COLORS.amber;
          }
        }
      }
    });

    // --- PÁGINA DOS QR CODES DE CHECK-IN ---
    // Adiciona uma quebra de página se houver algum convidado confirmado
    const confirmedGuests = guestsList.filter(g => g.status === 'confirmed');
    
    if (confirmedGuests.length > 0) {
      doc.addPage();
      
      // Título da seção de QR Codes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(...COLORS.darkNavy);
      doc.text('QR CODES INDIVIDUAIS PARA CHECK-IN', 15, 53);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('Imprima esta lista ou utilize diretamente na entrada para validar a presença dos convidados.', 15, 59);

      // Grid de QR Codes
      let currentY = 67;
      let col = 0; // 0, 1, 2
      const qrSize = 35; // 35mm
      const colWidth = (pageWidth - 30) / 3;

      for (let i = 0; i < confirmedGuests.length; i++) {
        const guest = confirmedGuests[i];
        
        // Se ultrapassar a página (limite de Y)
        if (currentY + qrSize + 20 > doc.internal.pageSize.height - 25) {
          doc.addPage();
          currentY = 53; // Inicia na margem correta do cabeçalho
          col = 0;
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(...COLORS.darkNavy);
          doc.text('QR CODES INDIVIDUAIS PARA CHECK-IN (CONTINUAÇÃO)', 15, 53);
          currentY += 14;
        }

        const currentX = 15 + (col * colWidth) + (colWidth - qrSize) / 2;

        // Gerar QR Code em Base64
        try {
          const qrUrl = await QRCode.toDataURL(guest.id, {
            margin: 1,
            width: 150,
            color: { dark: '#1a1a2e', light: '#ffffff' }
          });

          // Moldura do card do convidado
          doc.setFillColor(...COLORS.lightGray);
          doc.setDrawColor(220, 220, 220);
          doc.roundedRect(15 + (col * colWidth) + 2, currentY, colWidth - 4, qrSize + 20, 2, 2, 'FD');

          // Adicionar o QR Code
          doc.addImage(qrUrl, 'PNG', currentX, currentY + 3, qrSize, qrSize);

          // Nome do convidado abaixo do QR Code
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8);
          doc.setTextColor(...COLORS.darkNavy);
          
          // Truncar nome se for muito longo
          let displayName = guest.name;
          if (displayName.length > 18) {
            displayName = displayName.substring(0, 16) + '...';
          }
          doc.text(displayName, 15 + (col * colWidth) + colWidth / 2, currentY + qrSize + 7, { align: 'center' });

          // ID do Convidado
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.setTextColor(...COLORS.textMuted);
          doc.text(`ID: ${guest.id}`, 15 + (col * colWidth) + colWidth / 2, currentY + qrSize + 11, { align: 'center' });

          // Acompanhantes
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          doc.setTextColor(...COLORS.textMuted);
          const acCount = guest.companionNames ? guest.companionNames.length : 0;
          doc.text(`+ ${acCount} acompanhante(s)`, 15 + (col * colWidth) + colWidth / 2, currentY + qrSize + 15, { align: 'center' });

        } catch (err) {
          console.error('Erro ao gerar QR Code para o PDF:', err);
        }

        // Incrementar colunas e linhas
        col++;
        if (col > 2) {
          col = 0;
          currentY += qrSize + 22; // Avança para a próxima linha de cards
        }
      }
    }

    applyHeaderFooterToAllPages(doc, 'Lista de Convidados', party);
    doc.save(`lista-convidados-${party.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  },

  // 2. RELATÓRIO FINANCEIRO
  generateFinancePDF(party, expensesList) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;

    // Calcular estatísticas financeiras
    const totalBudget = party.budget || 0;
    const totalSpent = expensesList.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalPaid = expensesList.filter(exp => exp.status === 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalPending = expensesList.filter(exp => exp.status === 'pending').reduce((sum, exp) => sum + (exp.amount || 0), 0);
    
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const remainingBudget = totalBudget - totalSpent;

    // Desenhar Cards de Resumo no Topo (Y: 53 a Y: 80)
    const cardWidth = (pageWidth - 30 - 8) / 3; // 3 colunas
    const startY = 53;

    // Card 1: Orçamento Geral
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(15, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.darkNavy);
    doc.text(formatCurrency(totalBudget), 20, startY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('ORÇAMENTO TOTAL', 20, startY + 14);
    doc.setFontSize(7);
    doc.text(`Restam: ${formatCurrency(remainingBudget)}`, 20, startY + 18);

    // Card 2: Total Gasto (% Utilizado)
    const isOverBudget = totalSpent > totalBudget;
    doc.setFillColor(...(isOverBudget ? [254, 242, 242] : [240, 253, 244])); // Vermelho claro se estourou, verde se não
    doc.roundedRect(15 + cardWidth + 4, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...(isOverBudget ? COLORS.red : COLORS.green));
    doc.text(formatCurrency(totalSpent), 15 + cardWidth + 9, startY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('TOTAL CADASTRADO', 15 + cardWidth + 9, startY + 14);
    doc.setFontSize(7);
    doc.setTextColor(...(isOverBudget ? COLORS.red : COLORS.green));
    doc.text(`${budgetUsedPercentage.toFixed(1)}% do orçamento`, 15 + cardWidth + 9, startY + 18);

    // Card 3: Pago vs Pendente
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(15 + (cardWidth * 2) + 8, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.darkNavy);
    doc.text(`Pago: ${formatCurrency(totalPaid)}`, 15 + (cardWidth * 2) + 13, startY + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('STATUS DOS PAGAMENTOS', 15 + (cardWidth * 2) + 13, startY + 14);
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.amber);
    doc.text(`Pendente: ${formatCurrency(totalPending)}`, 15 + (cardWidth * 2) + 13, startY + 18);

    // Agrupar despesas por categoria
    const categoriesMap = {};
    expensesList.forEach(exp => {
      const cat = exp.category || 'Outros';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { total: 0, items: [] };
      }
      categoriesMap[cat].total += exp.amount || 0;
      categoriesMap[cat].items.push(exp);
    });

    // Tabela das despesas
    const tableHeaders = [['Categoria / Item', 'Fornecedor', 'Data de Venc.', 'Status', 'Valor']];
    const tableRows = [];

    Object.keys(categoriesMap).forEach(cat => {
      // Linha de Cabeçalho da Categoria (Negrito/Destacada)
      tableRows.push([
        { content: cat.toUpperCase(), colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 240, 240] } },
        { content: formatCurrency(categoriesMap[cat].total), styles: { fontStyle: 'bold', fillColor: [240, 240, 240], halign: 'right' } }
      ]);

      categoriesMap[cat].items.forEach(exp => {
        tableRows.push([
          `   ${exp.name}`,
          exp.supplier || '-',
          formatDate(exp.dueDate),
          exp.status === 'paid' ? 'Pago' : 'Pendente',
          { content: formatCurrency(exp.amount), styles: { halign: 'right' } }
        ]);
      });
    });

    // Se a lista estiver vazia
    if (expensesList.length === 0) {
      tableRows.push([
        { content: 'Nenhuma despesa cadastrada nesta festa.', colSpan: 5, styles: { halign: 'center' } }
      ]);
    }

    autoTable(doc, {
      startY: startY + 30,
      head: tableHeaders,
      body: tableRows,
      margin: { left: 15, right: 15, top: 48, bottom: 25 },
      theme: 'plain',
      headStyles: {
        fillColor: COLORS.darkNavy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 45 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 }
      },
      didParseCell: (data) => {
        // Estilo especial para linhas do corpo da tabela
        if (data.section === 'body') {
          // Destacar texto pago/pendente
          if (data.column.index === 3) {
            if (data.cell.raw === 'Pago') {
              data.cell.styles.textColor = COLORS.green;
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.raw === 'Pendente') {
              data.cell.styles.textColor = COLORS.amber;
              data.cell.styles.fontStyle = 'bold';
            }
          }
          // Adicionar linha de divisão fina
          data.cell.styles.borderBottomWidth = 0.1;
          data.cell.styles.borderBottomColor = [220, 220, 220];
        }
      }
    });

    // Seção final: Gráfico de Barras por Categoria desenhado com jsPDF shapes
    const lastY = doc.lastAutoTable.finalY + 15;
    
    if (expensesList.length > 0 && lastY + 60 < doc.internal.pageSize.height - 25) {
      // Título do gráfico
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...COLORS.darkNavy);
      doc.text('DISTRIBUIÇÃO DE GASTOS POR CATEGORIA', 15, lastY);

      // Desenhar gráfico
      const categories = Object.keys(categoriesMap);
      const maxCategoryTotal = Math.max(...categories.map(c => categoriesMap[c].total));

      let chartY = lastY + 10;
      const barMaxWidth = 100; // 100mm de largura máxima

      categories.forEach((cat, index) => {
        const catTotal = categoriesMap[cat].total;
        const barWidth = maxCategoryTotal > 0 ? (catTotal / maxCategoryTotal) * barMaxWidth : 0;

        // Label da categoria
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.textDark);
        doc.text(cat, 15, chartY + 4);

        // Barra de Gastos (Salmão)
        doc.setFillColor(...COLORS.salmon);
        doc.roundedRect(55, chartY, Math.max(barWidth, 1), 5, 1, 1, 'F');

        // Valor à direita da barra
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.darkNavy);
        doc.text(formatCurrency(catTotal), 60 + barWidth, chartY + 4);

        chartY += 9;
      });
    }

    applyHeaderFooterToAllPages(doc, 'Relatório Financeiro', party);
    doc.save(`financeiro-${party.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  },

  // 3. RELATÓRIO DE TAREFAS
  generateTaskListPDF(party, tasksList) {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;

    // Calcular estatísticas das tarefas
    const totalTasks = tasksList.length;
    const completedTasks = tasksList.filter(t => t.done).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Desenhar Cards de Resumo no Topo (Y: 53 a Y: 80)
    const cardWidth = (pageWidth - 30 - 8) / 3;
    const startY = 53;

    // Card 1: Total
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(15, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.darkNavy);
    doc.text(String(totalTasks), 20, startY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('TOTAL DE TAREFAS', 20, startY + 16);

    // Card 2: Concluídas (Taxa de conclusão)
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(15 + cardWidth + 4, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.green);
    doc.text(`${completedTasks} concluídas`, 15 + cardWidth + 9, startY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text(`Taxa: ${completionRate.toFixed(0)}% finalizada`, 15 + cardWidth + 9, startY + 16);

    // Card 3: Pendentes
    doc.setFillColor(254, 242, 242);
    doc.roundedRect(15 + (cardWidth * 2) + 8, startY, cardWidth, 22, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.red);
    doc.text(`${pendingTasks} pendentes`, 15 + (cardWidth * 2) + 13, startY + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textMuted);
    doc.text('AGUARDANDO RESOLUÇÃO', 15 + (cardWidth * 2) + 13, startY + 16);

    // Dividir as tarefas em Concluídas e Pendentes para listar separadamente
    const pendingList = tasksList.filter(t => !t.done);
    const completedList = tasksList.filter(t => t.done);

    const tableHeaders = [['Tarefa', 'Prioridade', 'Prazo Limit', 'Status']];
    const tableRows = [];

    // Seção 1: Tarefas Pendentes
    tableRows.push([
      { content: '⏳ TAREFAS PENDENTES', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [254, 243, 199], textColor: COLORS.amber } }
    ]);
    
    if (pendingList.length === 0) {
      tableRows.push([
        { content: 'Nenhuma tarefa pendente! Excelente trabalho! 🎉', colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } }
      ]);
    } else {
      pendingList.forEach(t => {
        tableRows.push([
          t.name,
          t.prioridade || 'Média',
          formatDate(t.date),
          'Pendente'
        ]);
      });
    }

    // Seção 2: Tarefas Concluídas
    tableRows.push([
      { content: '✅ TAREFAS CONCLUÍDAS', colSpan: 4, styles: { fontStyle: 'bold', fillColor: [240, 253, 244], textColor: COLORS.green } }
    ]);

    if (completedList.length === 0) {
      tableRows.push([
        { content: 'Nenhuma tarefa concluída ainda.', colSpan: 4, styles: { halign: 'center', fontStyle: 'italic' } }
      ]);
    } else {
      completedList.forEach(t => {
        tableRows.push([
          t.name,
          t.prioridade || 'Média',
          formatDate(t.date),
          'Concluída'
        ]);
      });
    }

    autoTable(doc, {
      startY: startY + 30,
      head: tableHeaders,
      body: tableRows,
      margin: { left: 15, right: 15, top: 48, bottom: 25 },
      theme: 'plain',
      headStyles: {
        fillColor: COLORS.darkNavy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9
      },
      columnStyles: {
        0: { cellWidth: 95, fontStyle: 'bold' },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 25 }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Destacar prioridade e status
          if (data.column.index === 1) {
            const val = data.cell.raw;
            if (val === 'Alta') data.cell.styles.textColor = COLORS.red;
            if (val === 'Média') data.cell.styles.textColor = COLORS.amber;
          }
          if (data.column.index === 3) {
            const val = data.cell.raw;
            if (val === 'Concluída') {
              data.cell.styles.textColor = COLORS.green;
              data.cell.styles.fontStyle = 'bold';
            }
            if (val === 'Pendente') {
              data.cell.styles.textColor = COLORS.amber;
              data.cell.styles.fontStyle = 'bold';
            }
          }
          data.cell.styles.borderBottomWidth = 0.1;
          data.cell.styles.borderBottomColor = [220, 220, 220];
        }
      }
    });

    applyHeaderFooterToAllPages(doc, 'Lista de Tarefas', party);
    doc.save(`tarefas-${party.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  }
};
