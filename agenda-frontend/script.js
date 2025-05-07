document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const listaContatos = document.getElementById("lista-contatos");
    const dbContatos = "http://localhost:3000/contatos";
    const contactsPerPage = 10;
    let currentPage = 1;
    let allContacts = [];

    fetch('/me', { credentials: 'include' })
    .then(response => {
      if (!response.ok) throw new Error('Não autenticado');
      return response.json();
    })
    .then(data => {
      const div = document.getElementById('user_data');
      div.innerHTML = `
        <p>${data.usuario.nome}</p>
        <p>${data.usuario.email}</p>
      `;
    })
    .catch(error => {
      window.location.href = '/login.html';
    });

    function carregarContatos() {
        fetch(dbContatos, { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                allContacts = data;
                renderContacts();
                renderPagination(allContacts.length);
            })
            .catch(error => console.error("Erro ao carregar contatos:", error));
    }

    function renderContacts() {
        listaContatos.innerHTML = "";
        const start = (currentPage - 1) * contactsPerPage;
        const end = currentPage * contactsPerPage;
        const contatosPagina = allContacts.slice(start, end);

        contatosPagina.forEach(contato => {
            const li = document.createElement("li");
            li.classList.add("col-2", "d-flex", "justify-content-center");
            li.dataset.id = contato.id;

            li.innerHTML = `
                <div class="contact-card d-flex flex-column" data-category="${contato.marcador || 'sem-marcador'}">
                    <details class="menueditcard">
                        <summary>⋮</summary>
                        <ul>
                            <li><a href="#">Detalhes</a></li>
                            <li><a href="#" class="edit" data-bs-toggle="modal" data-bs-target="#NovoContatoModal" data-id="${contato.id}">Editar</a></li>
                            <li><a href="#" class="delete" data-id="${contato.id}">Deletar</a></li>
                        </ul>
                    </details>
                    <img src="./img/pessoa.svg" alt="Foto de ${contato.nome}" class="truncate contact-img">
                    <h3 class="truncate">${contato.nome}</h3>
                    <p class="truncate"><img src="./img/iconPhone.svg" alt="">${contato.numero}</p>
                    <p class="truncate"><img src="./img/cartinha_email_icone.svg" alt="">${contato.email}</p>
                </div>
            `;

            li.querySelector(".edit").addEventListener("click", (e) => {
                e.preventDefault();
                editarContato(contato.id);
            });

            li.querySelector(".delete").addEventListener("click", (e) => {
                e.preventDefault();
                excluirContato(contato.id);
            });

            listaContatos.appendChild(li);
        });
    }

    function renderPagination(totalItems) {
        const pagination = document.getElementById("pagination-numbers");
        pagination.innerHTML = "";
    
        const totalPages = Math.ceil(totalItems / contactsPerPage);
    
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.textContent = i;
            btn.classList.add("page-btn");
            btn.classList.add("pagination-numbers");
            if (i === currentPage) btn.classList.add("active");
    
            btn.addEventListener("click", () => {
                currentPage = i;
                renderContacts();
                renderPagination(totalItems);
            });
    
            pagination.appendChild(btn);
        }
    
        // Atualiza os botões "prev" e "next"
        document.getElementById("prev-btn").disabled = currentPage === 1;
        document.getElementById("next-btn").disabled = currentPage === totalPages;
    
        document.getElementById("current-count").textContent = Math.min(currentPage * contactsPerPage, totalItems);
        document.getElementById("total-count").textContent = totalItems;
    }    

    document.getElementById("prev-btn").addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderContacts();
            renderPagination(allContacts.length);
        }
    });
    
    document.getElementById("next-btn").addEventListener("click", () => {
        const totalPages = Math.ceil(allContacts.length / contactsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderContacts();
            renderPagination(allContacts.length);
        }
    });    

    function editarContato(id) {
        fetch(`${dbContatos}/${id}`, { credentials: 'include' })
            .then(response => response.json())
            .then(contato => {
                document.getElementById("nome").value = contato.nome;
                document.getElementById("sobrenome").value = contato.sobrenome;
                document.getElementById("numero").value = contato.numero;
                document.getElementById("email").value = contato.email;
                document.getElementById("inputEndereço").value = contato.endereco || '';
                document.getElementById("inputMarcador").value = contato.marcador || '';
                document.getElementById("contatoId").value = contato.id;
            })
            .catch(error => console.error("Erro ao carregar dados do contato:", error));
    }

    function excluirContato(id) {
        if (confirm("Tem certeza que deseja excluir este contato?")) {
            fetch(`${dbContatos}/${id}`, { method: "DELETE", credentials: 'include' })
                .then(res => {
                    if (res.ok) {
                        carregarContatos();
                    } else {
                        return res.json().then(error => {
                            throw new Error(error.message || "Erro ao excluir contato");
                        });
                    }
                })
                .catch(error => {
                    console.error("Erro ao excluir contato:", error);
                    alert(error.message);
                });
        }
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        const nome = document.getElementById("nome").value;
        const sobrenome = document.getElementById("sobrenome").value;
        const numero = document.getElementById("numero").value;
        const email = document.getElementById("email").value;
        const endereco = document.getElementById("inputEndereço").value;
        const marcador = document.getElementById("inputMarcador").value;
        const id = document.getElementById("contatoId").value;

        if (!nome || !numero || !email) {
            alert("Os campos Nome, Telefone e E-mail são obrigatórios.");
            return;
        }

        const contatoData = { nome, sobrenome, numero, email, endereco, marcador };

        const fetchOptions = {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contatoData),
            credentials: 'include'
        };

        const url = id ? `${dbContatos}/${id}` : dbContatos;

        fetch(url, fetchOptions)
            .then(response => response.json())
            .then(() => {
                form.reset();
                document.getElementById("contatoId").value = "";
                carregarContatos();
            })
            .catch(error => console.error(`Erro ao ${id ? "editar" : "adicionar"} contato:`, error));
    });

    document.getElementById("search").addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        const filtered = allContacts.filter(contato => {
            return contato.nome.toLowerCase().includes(searchTerm) ||
                   contato.numero.toLowerCase().includes(searchTerm) ||
                   contato.email.toLowerCase().includes(searchTerm);
        });
        currentPage = 1;
        allContacts = filtered;
        renderContacts();
        renderPagination(filtered.length);
    });

    document.getElementById("grid").addEventListener("click", () => toggleFill("grid", "column"));
    document.getElementById("column").addEventListener("click", () => toggleFill("column", "grid"));

    function toggleFill(activeId, inactiveId) {
        document.querySelectorAll(`#${activeId} path`).forEach(p => p.setAttribute("fill", "#7451A5"));
        document.querySelectorAll(`#${inactiveId} path`).forEach(p => p.setAttribute("fill", "#c2c2c2"));
    }

    document.addEventListener("click", function (e) {
        document.querySelectorAll(".menueditcard[open]").forEach(menu => {
            if (!menu.contains(e.target)) {
                menu.removeAttribute("open");
            }
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm("Tem certeza que quer sair?")) {
            await fetch("/logout", { method: "POST", credentials: 'include' });
            window.location.href = "/login.html";
        }
    });

    carregarContatos();
});