

document.addEventListener('DOMContentLoaded', () => {
 
    const formItem = document.getElementById('formItem');
    const inputNome = document.getElementById('nome');
    const selectCategoria = document.getElementById('categoria');
    const selectEstado = document.getElementById('estado');
    const selectTipo = document.getElementById('tipo');
    const inputResponsavel = document.getElementById('responsavel');
    const inputDescricao = document.getElementById('descricao');
    
    const btnExemplos = document.getElementById('btnExemplos');
    const btnLimparTudo = document.getElementById('btnLimparTudo');
  
 
    const mensagemEl = document.getElementById('mensagem');
    const totalItensEl = document.getElementById('totalItens');
    const totalDisponiveisEl = document.getElementById('totalDisponiveis');
    const totalReservadosEl = document.getElementById('totalReservados');
    const totalDoacoesEl = document.getElementById('totalDoacoes');
    const quantidadeResultadosEl = document.getElementById('quantidadeResultados');
    const listaItensEl = document.getElementById('listaItens');
    const estadoVazioEl = document.getElementById('estadoVazio');
  
    let itens = [];
    let timeoutMensagem = null;

    function salvarDados() {
      localStorage.setItem('feira_itens_dados', JSON.stringify(itens));
    }
  
    function carregarDados() {
      const dados = localStorage.getItem('feira_itens_dados');
      if (dados) {
        try {
          itens = JSON.parse(dados);
        } catch (e) {
          itens = [];
        }
      }
      atualizarInterface();
    }
  
    function mostrarMensagem(texto, tipo = 'info') {
      mensagemEl.textContent = texto;
      mensagemEl.className = tipo;
  
      if (timeoutMensagem) clearTimeout(timeoutMensagem);
  
      timeoutMensagem = setTimeout(() => {
        mensagemEl.textContent = '';
        mensagemEl.className = '';
      }, 3500);
    }
  
    function atualizarResumo() {
      totalItensEl.textContent = itens.length;
      totalDisponiveisEl.textContent = itens.filter(i => !i.reservado).length;
      totalReservadosEl.textContent = itens.filter(i => i.reservado).length;
      totalDoacoesEl.textContent = itens.filter(i => i.tipo === 'Doação').length;
    }
  
    function escapeHTML(str) {
      return (str || '').replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[tag] || tag));
    }
 
    function renderizarCartoes() {
      quantidadeResultadosEl.textContent = `${itens.length} resultado(s)`;
  
      if (itens.length === 0) {
        listaItensEl.innerHTML = '';
        estadoVazioEl.style.display = 'block';
        return;
      }
  
      estadoVazioEl.style.display = 'none';
  
      listaItensEl.innerHTML = itens.map(item => `
        <div class="card-item ${item.reservado ? 'reservado' : ''}">
          <div class="card-header">
            <h3>${escapeHTML(item.nome)}</h3>
            <div>
              <span class="badge ${item.tipo === 'Troca' ? 'badge-troca' : 'badge-doacao'}">
                ${escapeHTML(item.tipo)}
              </span>
              <span class="badge ${item.reservado ? 'badge-reservado' : 'badge-disponivel'}">
                ${item.reservado ? 'Reservado' : 'Disponível'}
              </span>
            </div>
          </div>
          <div class="card-body">
            <p class="card-info"><strong>Categoria:</strong> ${escapeHTML(item.categoria)}</p>
            <p class="card-info"><strong>Estado:</strong> ${escapeHTML(item.estado)}</p>
            <p class="card-info"><strong>Responsável:</strong> ${escapeHTML(item.responsavel)}</p>
            <p class="card-desc">${escapeHTML(item.descricao)}</p>
          </div>
          <div class="card-actions">
            <button 
              class="btn-reserva ${item.reservado ? 'reservado' : ''}" 
              data-id="${item.id}"
              data-action="toggle"
            >
              ${item.reservado ? 'Disponibilizar' : 'Reservar'}
            </button>
            <button 
              class="btn-excluir" 
              data-id="${item.id}"
              data-action="delete"
            >
              Excluir
            </button>
          </div>
        </div>
      `).join('');
    }
  
    function atualizarInterface() {
      renderizarCartoes();
      atualizarResumo();
    }
  
    function limparErrosCampos() {
      [inputNome, selectCategoria, selectEstado, selectTipo, inputResponsavel, inputDescricao].forEach(el => {
        el.classList.remove('input-erro');
      });
    }
  
    function validarFormulario() {
      limparErrosCampos();
      let valido = true;
  
      if (!inputNome.value.trim()) { inputNome.classList.add('input-erro'); valido = false; }
      if (!selectCategoria.value) { selectCategoria.classList.add('input-erro'); valido = false; }
      if (!selectEstado.value) { selectEstado.classList.add('input-erro'); valido = false; }
      if (!selectTipo.value) { selectTipo.classList.add('input-erro'); valido = false; }
      if (!inputResponsavel.value.trim()) { inputResponsavel.classList.add('input-erro'); valido = false; }
      if (!inputDescricao.value.trim()) { inputDescricao.classList.add('input-erro'); valido = false; }
  
      return valido;
    }
  

    formItem.addEventListener('submit', (e) => {
      e.preventDefault();
  
      if (!validarFormulario()) {
        mostrarMensagem('Preencha todos os campos obrigatórios (*).', 'erro');
        return;
      }
  
      const novoItem = {
        id: Date.now().toString(),
        nome: inputNome.value.trim(),
        categoria: selectCategoria.value,
        estado: selectEstado.value,
        tipo: selectTipo.value,
        responsavel: inputResponsavel.value.trim(),
        descricao: inputDescricao.value.trim(),
        reservado: false
      };
  
      itens.push(novoItem);
      salvarDados();
      atualizarInterface();
  
      formItem.reset();
      limparErrosCampos();
      mostrarMensagem('Item cadastrado com sucesso!', 'sucesso');
    });
  
   
    listaItensEl.addEventListener('click', (e) => {
      const target = e.target;
      const id = target.getAttribute('data-id');
      const action = target.getAttribute('data-action');
  
      if (!id || !action) return;
  
      if (action === 'toggle') {
        const item = itens.find(i => i.id === id);
        if (item) {
          item.reservado = !item.reservado;
          salvarDados();
          atualizarInterface();
          mostrarMensagem(
            `Item "${item.nome}" marcado como ${item.reservado ? 'reservado' : 'disponível'}.`,
            'info'
          );
        }
      }
  
      if (action === 'delete') {
        const item = itens.find(i => i.id === id);
        if (item && confirm(`Deseja remover o item "${item.nome}"?`)) {
          itens = itens.filter(i => i.id !== id);
          salvarDados();
          atualizarInterface();
          mostrarMensagem('Item excluído com sucesso.', 'info');
        }
      }
    });
  
 
    btnExemplos.addEventListener('click', () => {
      const exemplos = [
        {
          id: (Date.now() + 1).toString(),
          nome: 'Aprenda JS em 21 Dias',
          categoria: 'Livros',
          estado: 'Bom',
          tipo: 'Troca',
          responsavel: 'Lucas Gabriel',
          descricao: 'Livro físico em bom estado, sem grifos.',
          reservado: false
        },
        {
          id: (Date.now() + 2).toString(),
          nome: 'Teclado USB Simples',
          categoria: 'Eletrônicos',
          estado: 'Usado',
          tipo: 'Doação',
          responsavel: 'Ana Paula',
          descricao: 'Teclado funcionando perfeitamente, ideal para estudos.',
          reservado: false
        }
      ];
  
      itens.push(...exemplos);
      salvarDados();
      atualizarInterface();
      mostrarMensagem('Itens de exemplo adicionados!', 'sucesso');
    });
  
    
    btnLimparTudo.addEventListener('click', () => {
      if (itens.length === 0) {
        mostrarMensagem('Não há itens para limpar.', 'info');
        return;
      }
  
      if (confirm('Tem certeza de que deseja apagar TODOS os itens cadastrados?')) {
        itens = [];
        salvarDados();
        atualizarInterface();
        mostrarMensagem('Todos os itens foram apagados.', 'info');
      }
    });
  
   
    carregarDados();
  });