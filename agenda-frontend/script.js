document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const listaContatos = document.getElementById("lista-contatos");
    const dbContatos = "http://localhost:3000/contatos";

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
                listaContatos.innerHTML = "";
                data.forEach(contato => {
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

                    // Eventos de Editar e Deletar
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
            })
            .catch(error => console.error("Erro ao carregar contatos:", error));
    }

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
                carregarContatos();
                form.reset();
                document.getElementById("contatoId").value = ""; // limpa ID
                location.reload();
            })
            .catch(error => console.error(`Erro ao ${id ? "editar" : "adicionar"} contato:`, error));
    });

    // Função de filtro por categoria
    function filterContacts(category) {
        document.querySelectorAll(".contact-card").forEach(card => {
            const contactCategory = card.dataset.category;
            card.style.display = (category === "all" || contactCategory === category) ? "flex" : "none";
        });
    }

    // Função de pesquisa
    document.getElementById("search").addEventListener("input", function () {
        const searchTerm = this.value.toLowerCase();
        document.querySelectorAll(".contact-card").forEach(card => {
            const name = card.querySelector("h3").textContent.toLowerCase();
            const phone = card.querySelector("p").textContent.toLowerCase();
            const email = card.querySelectorAll("p")[1].textContent.toLowerCase();
            card.style.display = (name.includes(searchTerm) || phone.includes(searchTerm) || email.includes(searchTerm)) ? "flex" : "none";
        });
    });

    // Layout toggle (grid/column)
    document.getElementById("grid").addEventListener("click", () => toggleFill("grid", "column"));
    document.getElementById("column").addEventListener("click", () => toggleFill("column", "grid"));
    function toggleFill(activeId, inactiveId) {
        document.querySelectorAll(`#${activeId} path`).forEach(p => p.setAttribute("fill", "#7451A5"));
        document.querySelectorAll(`#${inactiveId} path`).forEach(p => p.setAttribute("fill", "#c2c2c2"));
    }

    // Fechar o menu suspenso dos cards
    document.addEventListener("click", function (e) {
        document.querySelectorAll(".menueditcard[open]").forEach(menu => {
            if (!menu.contains(e.target)) {
                menu.removeAttribute("open");
            }
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm("Tem certeza que quer sair?")) {
            await fetch("/logout", { method: "POST", credentials: 'include' })
            window.location.href = "/login.html";
        }
    });

    // Inicialização
    carregarContatos();
    window.onload = () => filterContacts("all");
});
