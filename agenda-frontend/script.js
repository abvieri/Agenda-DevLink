// Criação de 45 contatos fictícios
const contacts = Array.from({ length: 45 }, (_, i) => ({
    nome: `Contato ${i + 1}`,
    telefone: `(11) 99999-00${i.toString().padStart(2, '0')}`,
    email: `contato${i + 1}@email.com`,
    imagem: 'usuario.png'
  }));
  
  // Seleção de elementos
  const contactList = document.getElementById('contactList');
  const paginationNumbers = document.getElementById('paginationNumbers');
  const currentCount = document.getElementById('currentCount');
  const totalCount = document.getElementById('totalCount');
  const prevPage = document.getElementById('prevPage');
  const nextPage = document.getElementById('nextPage');
  
  // Configurações de paginação
  const itemsPerPage = 6;
  let currentPage = 1;
  let totalPages = Math.ceil(contacts.length / itemsPerPage);
  
  // Renderiza os contatos
  function renderContacts() {
    contactList.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageContacts = contacts.slice(start, end);
  
    pageContacts.forEach(contact => {
      const card = document.createElement('div');
      card.className = 'contact-card';
      card.innerHTML = `
        <img src="${contact.imagem}" alt="${contact.nome}" class="contact-img">
        <h3>${contact.nome}</h3>
        <p><img src="phone.png" alt="">${contact.telefone}</p>
        <p><img src="email.png" alt="">${contact.email}</p>
      `;
      contactList.appendChild(card);
    });
  
    currentCount.textContent = currentPage;
    totalCount.textContent = totalPages;
  }
  
  // Renderiza botões da paginação
  function renderPagination() {
    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'page-number';
      if (i === currentPage) btn.classList.add('active');
  
      btn.addEventListener('click', () => {
        currentPage = i;
        updatePage();
      });
  
      paginationNumbers.appendChild(btn);
    }
  }
  
  // Atualiza a tela
  function updatePage() {
    renderContacts();
    renderPagination();
  }
  
  // Botão anterior
  prevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePage();
    }
  });
  
  // Botão próximo
  nextPage.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePage();
    }
  });
  
  // Busca dinâmica
  document.getElementById('searchBar').addEventListener('input', function (e) {
    const termo = e.target.value.toLowerCase();
    const filtrados = contacts.filter(c =>
      c.nome.toLowerCase().includes(termo) ||
      c.telefone.includes(termo) ||
      c.email.toLowerCase().includes(termo)
    );
  
    totalPages = Math.ceil(filtrados.length / itemsPerPage);
    currentPage = 1;
  
    renderContactsFromList(filtrados);
    renderPaginationFromList(filtrados);
  });
  
  // Renderiza contatos filtrados
  function renderContactsFromList(lista) {
    contactList.innerHTML = '';
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageContacts = lista.slice(start, end);
  
    pageContacts.forEach(contact => {
      const card = document.createElement('div');
      card.className = 'contact-card';
      card.innerHTML = `
        <img src="${contact.imagem}" alt="${contact.nome}" class="contact-img">
        <h3>${contact.nome}</h3>
        <p><img src="phone.png" alt="">${contact.telefone}</p>
        <p><img src="email.png" alt="">${contact.email}</p>
      `;
      contactList.appendChild(card);
    });
  
    currentCount.textContent = currentPage;
    totalCount.textContent = totalPages;
  }
  
  // Renderiza paginação filtrada
  function renderPaginationFromList(lista) {
    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.className = 'page-number';
      if (i === currentPage) btn.classList.add('active');
  
      btn.addEventListener('click', () => {
        currentPage = i;
        renderContactsFromList(lista);
        renderPaginationFromList(lista);
      });
  
      paginationNumbers.appendChild(btn);
    }
  }
  
  // Primeira renderização
  updatePage();
  