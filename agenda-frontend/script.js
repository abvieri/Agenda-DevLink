document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const dbContatos = "http://localhost:3000/contatos";
    // const dbContatos = "/contatos";
    let listaContatos = document.getElementById("lista-contatos");
    const contactsPerPage = 10;
    let currentPage = 1;
    let allContacts = [];

    fetch('/me', { credentials: 'include' })
        .then(response => {
            if (!response.ok) throw new Error('Não autenticado');
            return response.json();
        })
        .then(data => {
            carregarMarcadores(data.usuario.id);
            const div = document.getElementById('user_data');
            div.innerHTML = `
        <p>${data.usuario.nome}</p>
        <p>${data.usuario.email}</p>
      `;
        })
        .catch(error => {
            window.location.href = 'http://localhost:3000//login.html';
        });

    setInterval(() => {
        const telaCelular = document.getElementById("tela_celular");
        const listaContatosLista = document.getElementById("lista-contatos-lista");

        if (getComputedStyle(telaCelular).display === "flex" && listaContatosLista.children.length === 0) {
            // Copia os contatos já renderizados para a outra lista
            const contatosOriginais = document.querySelectorAll("#lista-contatos > li");
            contatosOriginais.forEach(contato => {
                const clone = contato.cloneNode(true);
                listaContatosLista.appendChild(clone);
            });
        }
    }, 500);

    function carregarContatos() {
        fetch(dbContatos, { credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                allContacts = data;
                renderContacts();
                renderPagination(allContacts.length);
                loadContacts(data);
            })
            .catch(error => console.error("Erro ao carregar contatos:", error));
    }

    let originalContacts = [...allContacts];
    function loadContacts(data) {
        allContacts = [...data];
        originalContacts = [...allContacts];
    }

    let layoutAtual = null; // Para rastrear se o layout já está no formato certo

    function renderContacts() {
        listaContatos.innerHTML = "";
        const start = (currentPage - 1) * contactsPerPage;
        const end = currentPage * contactsPerPage;
        const contatosPagina = allContacts.slice(start, end);

        const isFlex = getComputedStyle(listaContatos).display === "flex";

        layoutAtual = isFlex ? "flex" : "default";

        contatosPagina.forEach(contato => {
            const li = document.createElement("li");
            li.classList.add("col-2", "d-flex", "justify-content-center");
            li.dataset.id = contato.id;

            if (isFlex) {
                li.innerHTML = `
                <article class="person-card">
                    <div class="person-content">
                        <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/650ae74ea732e2f8ac406f213e3b254ddcd17031?placeholderIfAbsent=true&apiKey=8484f7e9660d47ecb9b8823192ab8b78"
                             alt="Profile picture of ${contato.nome}" class="profile-image">
                        <div class="person-info">
                            <h2 class="person-name">${contato.nome}</h2>
                            <p class="person-email">${contato.email}</p>
                        </div>
                    </div>
                </article>
            `;
            } else {
                li.innerHTML = `
                <div class="contact-card d-flex flex-column" data-category="${contato.marcador || 'sem-marcador'}">
                    <details class="menueditcard">
                        <summary>⋮</summary>
                        <ul>
                            <li><a href="#" class="detalhes" data-bs-toggle="modal" data-bs-target="#DetalhesModal" data-id="${contato.id}">Detalhes</a></li>
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

                li.querySelector(".detalhes").addEventListener("click", (e) => {
                    e.preventDefault();
                    DetalhesContato(contato.id);
                });

                li.querySelector(".edit").addEventListener("click", (e) => {
                    e.preventDefault();
                    editarContato(contato.id);
                });

                li.querySelector(".delete").addEventListener("click", (e) => {
                    e.preventDefault();
                    excluirContato(contato.id);
                });
            }

            listaContatos.appendChild(li);
        });
    }

    // Verifica mudança de layout a cada 500ms
    setInterval(() => {
        const isFlex = getComputedStyle(listaContatos).display === "flex";
        const novoLayout = isFlex ? "flex" : "default";

        if (novoLayout !== layoutAtual) {
            carregarContatos();
        }
    }, 500);

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

    // Ao carregar o contato para edição
    function editarContato(id) {
        fetch(`/contatos/${id}`, { credentials: 'include' })
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

    // Submeter as alterações do contato (ao clicar no botão de salvar)
    document.getElementById("form-contato").addEventListener("submit", function (e) {
        e.preventDefault();

        // Verifica se o campo "contatoId" está preenchido (indicando que estamos editando um contato)
        const contatoId = document.getElementById("contatoId").value;

        if (contatoId) {
            const dados = {
                nome: document.getElementById("nome").value,
                sobrenome: document.getElementById("sobrenome").value,
                numero: document.getElementById("numero").value,
                email: document.getElementById("email").value,
                endereco: document.getElementById("inputEndereço").value,
                marcador: document.getElementById("inputMarcador").value,
            };

            fetch(`/contatos/${contatoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(dados)
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === 'Contato atualizado com sucesso') {
                        alert('Contato atualizado!');
                        location.reload(); // Recarrega a página
                    } else {
                        alert('Erro: ' + data.message);
                    }
                })
                .catch(err => {
                    console.error('Erro ao atualizar contato:', err);
                    alert('Erro interno');
                });
        } else {
            // Caso não tenha "contatoId", significa que o formulário não está sendo usado para editar, então não faz nada
            console.log("Formulário não está em modo de edição");
        }
    });

    function excluirContato(id) {
        if (confirm("Tem certeza que deseja excluir este contato?")) {
            fetch(`${dbContatos}/${id}`, { method: "DELETE", credentials: 'include' })
                .then(res => {
                    if (res.ok) {
                        location.reload();
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

    function DetalhesContato(id) {
        fetch(`${dbContatos}/${id}`, { credentials: 'include' })
            .then(response => response.json())
            .then(contato => {
                document.getElementById('detalheNome').textContent = contato.nome;
                document.getElementById('detalheSobrenome').textContent = contato.sobrenome;
                document.getElementById('detalheEndereco').textContent = contato.endereco;
                document.getElementById('detalheEmail').textContent = contato.email;
                document.getElementById('detalheTelefone').textContent = contato.numero;
                document.getElementById('detalheMarcador').textContent = contato.marcador;
            })
            .catch(error => console.error("Erro ao carregar dados do contato:", error));
        // Abre o modal
        // let modal = new bootstrap.Modal(document.getElementById('DetalhesModal'));
        // modal.show();
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

    let marcadorSelecionado = "";
    document.getElementById("search").addEventListener("input", searchContacts);
    function searchContacts() {
        const searchTerm = document.getElementById("search").value.toLowerCase();

        allContacts = originalContacts.filter(contato => {
            const nomeOk = contato.nome.toLowerCase().includes(searchTerm);
            const numeroOk = contato.numero.toLowerCase().includes(searchTerm);
            const emailOk = contato.email.toLowerCase().includes(searchTerm);

            const marcadorOk = !marcadorSelecionado || marcadorSelecionado === "Todos" || contato.marcador === marcadorSelecionado;

            return (nomeOk || numeroOk || emailOk) && marcadorOk;
        });

        currentPage = 1;
        renderContacts();
        renderPagination(allContacts.length);
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

    async function carregarMarcadores() {
        try {
            const response = await fetch('/marcadores');
            const marcadores = await response.json();

            const dropdown = document.getElementById('marcadoresDropdown');
            const titulo = document.getElementById('titulo-marcadores');
            dropdown.innerHTML = '';

            const nomesUnicos = new Set();
            marcadores.forEach(({ marcador }) => {
                if (marcador && !nomesUnicos.has(marcador)) {
                    nomesUnicos.add(marcador);

                    const li = document.createElement('li');
                    const button = document.createElement('button');
                    button.className = 'dropdown-item';
                    button.id = marcador;
                    button.textContent = marcador;
                    button.onclick = () => {
                        titulo.textContent = marcador;
                        marcadorSelecionado = marcador;
                        searchContacts();
                    };
                    li.appendChild(button);
                    dropdown.appendChild(li);
                }
            });

            // Adiciona separador e botão "Todos"
            if (nomesUnicos.size > 0) {
                const divider = document.createElement('li');
                divider.innerHTML = '<hr class="dropdown-divider">';
                dropdown.appendChild(divider);
            }

            const liTodos = document.createElement('li');
            const btnTodos = document.createElement('button');
            btnTodos.className = 'dropdown-item tab-btn';
            btnTodos.id = 'Todos';
            btnTodos.textContent = 'Todos';
            btnTodos.onclick = () => {
                titulo.textContent = 'Marcadores';
                location.reload();
            };
            liTodos.appendChild(btnTodos);
            dropdown.appendChild(liTodos);

        } catch (error) {
            console.error('Erro ao carregar marcadores:', error);
        }
    }

    carregarMarcadores();
    carregarContatos();
});