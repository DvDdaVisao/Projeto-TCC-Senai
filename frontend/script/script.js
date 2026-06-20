// ==========================================
// VARIÁVEIS DE CONTROLE DE ESTADO
// ==========================================
let modoEdicaoAtivo = false; // Controla se o usuário está na fase "Selecione o Objeto"
let linhaSendoEditada = null; // Guarda a referência da linha da tabela que o usuário clicou
let ordemCrescenteCriticidade = true; // Controla a direção da ordenação de criticidade
let ordemCrescenteEtapa = true; // Controla a direção da ordenação de etapas

// ==========================================
// LÓGICA DA TELA DE LOGIN (RF1)
// ==========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        console.log("Formulário de login interceptado com sucesso.");
        window.location.href = "home.html"; 
    });
}

// ==========================================
// LÓGICA DA TELA HOME & MODAL (RF2 e RF3)
// ==========================================

function ativarModoEdicao() {
    modoEdicaoAtivo = true;
    document.getElementById('botoesPadrao').style.display = 'none';
    document.getElementById('avisoSelecao').style.display = 'flex';
}

function cancelarModoEdicao() {
    modoEdicaoAtivo = false;
    document.getElementById('avisoSelecao').style.display = 'none';
    document.getElementById('botoesPadrao').style.display = 'flex';
}

// Função disparada ao clicar na linha da tabela (O item)
function abrirRF3(tagEquipamento, elementoLinha) {
    if (!modoEdicaoAtivo) {
        console.log("Clique bloqueado: Sistema não está no modo de edição.");
        return; 
    }

    console.log("Item selecionado com sucesso. Abrindo formulário para:", tagEquipamento);

    linhaSendoEditada = elementoLinha;
    cancelarModoEdicao();

    const modal = document.getElementById('modalEquipamento');
    document.getElementById('modalTitle').innerText = "Editar Equipamento";
    document.getElementById('inputTag').disabled = true;

    // Captura as classes de badge reais da linha para marcar os selects corretamente
    const badgeCriticidade = elementoLinha.cells[4].querySelector('.badge').classList[1];
    const badgeEtapa = elementoLinha.cells[5].querySelector('.badge').classList[1];

    // Preenche os campos do modal com os dados REAIS da linha selecionada
    document.getElementById('inputTag').value = tagEquipamento;
    document.getElementById('inputNome').value = elementoLinha.cells[1].innerText;
    document.getElementById('inputFabricante').value = ""; // Fica limpo para o usuário preencher
    document.getElementById('txtDescricao').value = elementoLinha.cells[3].innerText === 'Sem observações.' ? '' : elementoLinha.cells[3].innerText;
    document.getElementById('selectCriticidade').value = badgeCriticidade;
    document.getElementById('selectEtapa').value = badgeEtapa;

    modal.classList.add('active');
}

function abrirParaCadastrar() {
    cancelarModoEdicao(); 
    linhaSendoEditada = null; 
    
    const modal = document.getElementById('modalEquipamento');
    document.getElementById('modalTitle').innerText = "Cadastrar Novo Item";
    document.getElementById('formEquipamento').reset();
    document.getElementById('inputTag').disabled = false;

    modal.classList.add('active');
}

function fecharModal() {
    document.getElementById('modalEquipamento').classList.remove('active');
    linhaSendoEditada = null;
}

// ==========================================
// ESCUTADOR DO FORMULÁRIO (SALVAR / CADASTRAR)
// ==========================================
const formEquipamento = document.getElementById('formEquipamento');

if (formEquipamento) {
    formEquipamento.addEventListener('submit', function(event) {
        event.preventDefault(); 

        const tag = document.getElementById('inputTag').value;
        const nome = document.getElementById('inputNome').value;
        const descricao = document.getElementById('txtDescricao').value;
        const criticidade = document.getElementById('selectCriticidade').value;
        const etapa = document.getElementById('selectEtapa').value;

        const tituloModal = document.getElementById('modalTitle').innerText;

        if (tituloModal === "Cadastrar Novo Item") {
            const tabelaBody = document.querySelector('.custom-table tbody');
            const novaLinha = document.createElement('tr');
            novaLinha.style.cursor = "pointer";
            
            novaLinha.addEventListener('click', function() {
                abrirRF3(tag, this);
            });

            novaLinha.innerHTML = `
                <td>${tag.toUpperCase()}</td>
                <td>${nome}</td>
                <td>Planta de Beneficiamento</td>
                <td>${descricao ? descricao : 'Sem observações.'}</td>
                <td><span class="badge ${criticidade}">${criticidade.toUpperCase()}</span></td>
                <td><span class="badge ${etapa}">${etapa.toUpperCase()}</span></td>
            `;

            tabelaBody.insertBefore(novaLinha, tabelaBody.firstChild);
            console.log(`Equipamento ${tag} adicionado com sucesso!`);

        } else {
            if (linhaSendoEditada) {
                // Atualiza em tempo real a linha selecionada
                linhaSendoEditada.cells[1].innerText = nome;
                linhaSendoEditada.cells[3].innerText = descricao ? descricao : 'Sem observações.';
                linhaSendoEditada.cells[4].innerHTML = `<span class="badge ${criticidade}">${criticidade.toUpperCase()}</span>`;
                linhaSendoEditada.cells[5].innerHTML = `<span class="badge ${etapa}">${etapa.toUpperCase()}</span>`;
                console.log(`Equipamento ${tag} atualizado dinamicamente.`);
            }
        }

        fecharModal();
    });
}

// ==========================================
// LÓGICA DA BARRA DE PESQUISA (FILTRO DINÂMICO)
// ==========================================
const inputPesquisa = document.querySelector('.search-input');

if (inputPesquisa) {
    inputPesquisa.addEventListener('input', function() {
        const termoPesquisa = this.value.toLowerCase();
        const linhasTabela = document.querySelectorAll('.custom-table tbody tr');

        linhasTabela.forEach(function(linha) {
            if (linha.cells.length > 0) {
                const tag = linha.cells[0].innerText.toLowerCase();
                const nome = linha.cells[1].innerText.toLowerCase();

                if (tag.includes(termoPesquisa) || nome.includes(termoPesquisa)) {
                    linha.style.display = ""; 
                } else {
                    linha.style.display = "none"; 
                }
            }
        });
    });
}

// ==========================================
// LÓGICA DE ORDENAÇÃO POR CRITICIDADE
// ==========================================
function ordenarPorCriticidade() {
    const tabelaBody = document.querySelector('.custom-table tbody');
    const linhas = Array.from(tabelaBody.querySelectorAll('tr'));

    const pesos = { 'ALTA': 3, 'MÉDIA': 2, 'MEDIA': 2, 'BAIXA': 1 };

    linhas.sort(function(linhaA, linhaB) {
        const badgeA = linhaA.cells[4].querySelector('.badge');
        const badgeB = linhaB.cells[4].querySelector('.badge');

        const textoA = badgeA ? badgeA.innerText.toUpperCase().trim() : '';
        const textoB = badgeB ? badgeB.innerText.toUpperCase().trim() : '';

        const pesoA = pesos[textoA] || 0;
        const pesoB = pesos[textoB] || 0;

        return ordemCrescenteCriticidade ? pesoB - pesoA : pesoA - pesoB;
    });

    linhas.forEach(linha => tabelaBody.appendChild(linha));

    const seta = document.getElementById('setaCriticidade');
    if (seta) seta.innerText = ordemCrescenteCriticidade ? "⬇" : "⬆";
    
    ordemCrescenteCriticidade = !ordemCrescenteCriticidade;
}

// ==========================================
// LÓGICA DE ORDENAÇÃO POR ETAPA DE REPARO
// ==========================================
function ordenarPorEtapa() {
    const tabelaBody = document.querySelector('.custom-table tbody');
    const linhas = Array.from(tabelaBody.querySelectorAll('tr'));

    const fluxoEtapas = { 'ENVIO': 1, 'PERITAGEM': 2, 'APROVAÇÃO': 3, 'APROVACAO': 3, 'EXECUÇÃO': 4, 'EXECUCAO': 4, 'RETORNO': 5 };

    linhas.sort(function(linhaA, linhaB) {
        const badgeA = inlineA = linhaA.cells[5].querySelector('.badge');
        const badgeB = inlineB = linhaB.cells[5].querySelector('.badge');

        const textoA = badgeA ? badgeA.innerText.toUpperCase().trim() : '';
        const textoB = badgeB ? badgeB.innerText.toUpperCase().trim() : '';

        const pesoA = fluxoEtapas[textoA] || 0;
        const pesoB = fluxoEtapas[textoB] || 0;

        return ordemCrescenteEtapa ? pesoA - pesoB : pesoB - pesoA;
    });

    linhas.forEach(linha => tabelaBody.appendChild(linha));

    const seta = document.getElementById('setaEtapa');
    if (seta) seta.innerText = ordemCrescenteEtapa ? "⬇" : "⬆";

    ordemCrescenteEtapa = !ordemCrescenteEtapa;
}