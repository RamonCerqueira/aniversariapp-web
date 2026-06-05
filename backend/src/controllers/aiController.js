export const getChurrascoAiAdvice = async (req, res) => {
  const { men, women, children, beerDrinkers } = req.body;

  const m = parseInt(men) || 0;
  const w = parseInt(women) || 0;
  const c = parseInt(children) || 0;
  const bd = parseInt(beerDrinkers) || 0;

  // Lógica de cálculo padrão revisada (mais realista!)
  const totalMeatKg = ((m * 400) + (w * 300) + (c * 200)) / 1000;
  
  // Proporções realistas de carnes
  const beefKg = (totalMeatKg * 0.5).toFixed(1);
  const porkKg = (totalMeatKg * 0.3).toFixed(1);
  const chickenKg = (totalMeatKg * 0.2).toFixed(1);

  // Correção do pão de alho: 1.5 pão por adulto, 1 por criança. 
  // Geralmente pacotes vêm com 5. Vamos estimar unidades reais de forma mais equilibrada!
  const garlicBread = Math.ceil((m + w) * 1.2 + c * 0.8);
  const beerLiters = bd * 1.5;
  const beerCans = Math.ceil((beerLiters * 1000) / 350);
  const coalBags = Math.ceil(totalMeatKg / 5);
  const grossSaltKg = (totalMeatKg * 0.04).toFixed(1); // 40g por kg

  const prompt = `Você é o lendário "Chef Assador do Celebrate!", um mestre churrasqueiro de renome internacional especializado em churrasco de altíssima gastronomia, charcutaria artesanal e banquetes de luxo ("Celebrate!").
Estamos organizando uma experiência gastronômica memorável ao redor do fogo com a seguinte demografia e duração:
- Homens: ${m}
- Mulheres: ${w}
- Crianças: ${c}
- Consumidores de Cerveja: ${bd}
- Duração do Evento: 5 horas de brasa ativa

O nosso algoritmo de pesagem estimou as seguintes quantidades base (que você deve transformar em sugestões de cortes nobres e insumos gourmet de primeiríssima qualidade):
- Carne Bovina Estimada: ${beefKg} kg (distribua em cortes de altíssimo nível, como Bife de Ancho Black Angus certificado, Picanha Prime com espessa capa de gordura, Assado de Tira Wagyu ou Fraldinha Red extra limpa).
- Carne Suína e Linguiças Estimadas: ${porkKg} kg (distribua em embutidos finos e charcutaria gourmet, como Pancetta Pururuca laqueada em redução de cachaça e melado, Linguiça Artesanal recheada com queijo coalho e ervas frescas, ou Linguiça de Costela Angus).
- Frango Estimado: ${chickenKg} kg (distribua em cortes requintados, como Tulipa de Frango marinada em cerveja Double IPA e Dry Rub de páprica defumada, ou Sobrecoxa Desossada glaceada com mel de laranjeira).
- Pão de Alho Base: ${garlicBread} unidades (sugira versões artesanais de fermentação natural, ex: Pão de Alho sourdough com manteiga de trufas e queijo grana padano).
- Cerveja Recomendada: ${beerCans} latas (especifique estilos artesanais de cerveja para harmonizar com cada etapa, ex: IPA para cortes gordurosos, Red Ale para o frango glaceado, Witbier para entradas leves).
- Carvão: ${coalBags} sacos
- Sal Grosso: ${grossSaltKg} kg

Analise minuciosamente a demografia deste grupo de ${m + w + c} convidados para criar uma experiência perfeitamente personalizada:
1. Se houver Crianças (${c}), sugira opções gourmet divertidas e fáceis de saborear (como mini-espetinhos de mignon com queijo coalho grelhado ou tulipa de frango lollipop).
2. Se houver muitos Bebedores de Cerveja (${bd}), traga cortes robustos e ricos em gordura entremeada (como chorizo ou pancetta pururuca) que pedem e realçam a potência de boas cervejas.
3. Se houver mais Mulheres (${w}) ou uma distribuição equilibrada, introduza leveza elegante no cardápio, como cortes de frango com marinadas cítricas refinadas, vegetais grelhados na brasa (ex: aspargos com azeite de trufas, tomates confitados no espeto) e queijo coalho com ervas.
4. Harmonização de Bebidas: Cite explicitamente estilos de cerveja artesanal para harmonizar com os cortes recomendados.

Sua mentoria deve ser extremamente envolvente, carismática e poética. Suas sugestões devem fazer a boca encher de água só de ler. Use termos profissionais e ricos: "selamento reverso", "zona de calor indireto", "marmorização 4+", "caramelização de Maillard", "descanso para redistribuição de sucos", "defumação a frio", "lascas de lenha frutífera".

Responda ÚNICA E EXCLUSIVAMENTE com um objeto JSON válido, sem qualquer tipo de formatação Markdown ou blocos de código (nunca use \`\`\`json ou \`\`\`), no seguinte formato de chaves:
{
  "grillingTips": "Sua mentoria profissional em 2 a 3 parágrafos curtos, extremamente sedutores e técnicos. Ensine um segredo específico para o sucesso deste evento (ex: como controlar as zonas de calor na grelha para servir as linguiças no início e as carnes premium em sequência perfeita, a importância do descanso da carne de 2 minutos antes de cortar para reter a suculência máxima, e o uso de sal de flor de sal ou sal trufado pós-grelha).",
  "meatSuggestions": [
    { "cut": "Nome do Corte Premium (ex: Picanha Black Angus Black Series (Marmorização 4+))", "quantity": "Peso sugerido fracionado (ex: 1.5 kg)", "reason": "Uma descrição gourmet super rica, suculenta e poética explicando o porquê da escolha para este perfil de convidados, a experiência de sabor na boca e a recomendação de ponto de cozimento ideal (ex: ao ponto do chef, selado por fora e rosado no centro)." }
  ],
  "sidesSuggestions": [
    { "side": "Acompanhamento Gourmet do Chef (ex: Queijo Coalho Maçaricado com Mel de Engenho Trufado e Alecrim)", "quantity": "Quantidade sugerida (ex: 2.0 kg)", "tip": "Uma dica culinária espetacular explicando o método de preparo na brasa, o toque final de apresentação e como ele complementa o sabor das carnes principais." }
  ]
}`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback se a API key do Gemini não estiver configurada no .env
      console.warn("GEMINI_API_KEY não configurada no .env. Retornando fallback realista do Chef.");
      
      const totalPeople = m + w + c;
      const fallbackData = {
        grillingTips: `Mentoria do Chef Celebrate!: Para celebrar este momento único com seus ${totalPeople} convidados, o segredo da brasa perfeita está no controle das zonas de temperatura. Crie uma zona de fogo direto (muito quente) para selar e caramelizar as fibras das carnes nobres rapidamente, e uma zona de fogo indireto (calor moderado) para assar lentamente os embutidos e o frango glaceado. Lembre-se: após grelhar seus cortes premium, deixe a carne descansar na tábua por 2 a 3 minutos antes de fatiar. Isso garante que os sucos internos se redistribuam, mantendo cada pedaço incrivelmente suculento e macio.`,
        meatSuggestions: [
          {
            cut: "Picanha Premium Black Angus (Marmorização 4+)",
            quantity: `${(beefKg * 0.6).toFixed(1)} kg`,
            reason: "O corte mais nobre do churrasco brasileiro, cortado em bifes de tira espessos. Selado em fogo forte para obter uma crosta caramelizada perfeita (reação de Maillard) e servido ao ponto do chef, garantindo uma maciez incomparável aos adultos e bebedores de cerveja."
          },
          {
            cut: "Bife de Chorizo Wagyu fatiado",
            quantity: `${(beefKg * 0.4).toFixed(1)} kg`,
            reason: "Corte tradicional argentino com marmorização espetacular. Perfeito para grelhar rapidamente em fogo altíssimo, oferecendo um sabor de gordura rica que harmoniza magnificamente bem com cervejas encorpadas."
          },
          {
            cut: "Pancetta Pururuca com Ervas de Provence",
            quantity: `${(porkKg * 0.5).toFixed(1)} kg`,
            reason: "Barriga de porco premium selecionada, marinada com toques cítricos e assada em calor indireto até a pele ficar extremamente crocante. O equilíbrio perfeito de suculência e textura."
          },
          {
            cut: "Linguiça Artesanal de Costela com Provolone",
            quantity: `${(porkKg * 0.5).toFixed(1)} kg`,
            reason: "Embutido gourmet de fabricação artesanal. O queijo provolone derrete suavemente por dentro durante o cozimento lento, criando uma explosão de sabor defumado ideal para abrir o churrasco."
          },
          {
            cut: "Tulipa de Frango Glaceada com Dry Rub e Mel",
            quantity: `${chickenKg} kg`,
            reason: "Asasinhas de frango selecionadas, polvilhadas com nosso Dry Rub Celebrate! (páprica, cebola e especiarias) e pinceladas com mel de flor de laranjeira no final da grelha. Suculento, adocicado e o favorito absoluto das crianças!"
          }
        ],
        sidesSuggestions: [
          {
            side: "Pão de Alho Sourdough com Manteiga de Trufas e Grana Padano",
            quantity: `${garlicBread} unidades`,
            tip: "Pão de fermentação natural recheado com creme de alho assado confitado e manteiga trufada, finalizado na brasa e salpicado com queijo Grana Padano ralado na hora. Crocante por fora e derretendo por dentro."
          },
          {
            side: "Queijo Coalho Grelhado com Mel de Engenho Trufado e Alecrim",
            quantity: `${Math.ceil(totalPeople * 0.8)} espetos`,
            tip: "Espetos de queijo coalho selecionado, tostados na grelha até criar uma casca dourada e crocante. Servido maçaricado com um fio de mel de engenho trufado e folhas de alecrim fresco defumadas."
          },
          {
            side: "Farofa de Brioche Caramelizada com Amêndoas Tostadas",
            quantity: `${(totalPeople * 0.05).toFixed(1)} kg`,
            tip: "Feita com brioche artesanal moído, refogada lentamente em manteiga noisette com bacon crocante e finalizada com lascas de amêndoas levemente tostadas. Traz uma crocância doce e salgada espetacular."
          }
        ]
      };
      
      return res.json(fallbackData);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API respondeu com status ${response.status}`);
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Sanitização simples caso a IA retorne markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedData = JSON.parse(text);
    res.json(parsedData);
  } catch (error) {
    console.error("Erro ao chamar a IA do Gemini:", error);
    
    // Em caso de falha de conexão ou parser, retorna o fallback para garantir robustez
    const totalPeople = m + w + c;
    const errorFallback = {
      grillingTips: "Mentoria do Chef Celebrate!: O segredo para um churrasco inesquecível é o controle do fogo. Divida sua churrasqueira em duas zonas: fogo forte para selar cortes premium e manter a suculência, e fogo médio-brando para finalizar linguiças e pães de alho sem queimar. Lembre-se sempre de deixar a carne descansar por 2 minutos na tábua antes de fatiar para reter os sucos naturais das peças.",
      meatSuggestions: [
        { cut: "Bife de Chorizo Angus (Marmorização 4+)", quantity: `${beefKg} kg`, reason: "Corte traseiro extremamente macio, com generosa capa de gordura lateral. Deve ser selado em brasa quente e servido ao ponto para realçar a suculência." },
        { cut: "Pancetta de Rolo Grelhada", quantity: `${porkKg} kg`, reason: "Barriga de porco premium assada em calor médio e finalizada em fogo forte para pururucar a pele. Uma explosão de texturas." },
        { cut: "Tulipa de Frango ao Dry Rub Celebrate!", quantity: `${chickenKg} kg`, reason: "Meio da asa de frango temperado com mix de especiarias gourmet e assado lentamente. Suculência garantida para crianças e adultos." }
      ],
      sidesSuggestions: [
        { side: "Pão de Alho de Sourdough com Ervas Finas", quantity: `${garlicBread} un`, tip: "Grelhado lentamente em calor médio até dourar. O aroma do pão artesanal combina perfeitamente com os cortes bovinos." },
        { side: "Queijo Coalho com Mel de Engenho e Alecrim", quantity: `${Math.ceil(m + w)} un`, tip: "Tostado por igual, finalizado com mel de engenho e ramos de alecrim para perfumar a mesa." }
      ]
    };
    res.json(errorFallback);
  }
};
