document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const listaContatos = document.getElementById("lista-contatos");
    const dbContatos = "http://localhost:3000/contatos";
    // const dbContatos = "/contatos";

    // Função para carregar os contatos da API
    function carregarContatos() {
        fetch(dbContatos)
            .then(response => response.json())
            .then(data => {
                listaContatos.innerHTML = "";
                data.forEach(contato => {
                    const li = document.createElement("li");
                    li.classList.add("col-2", "d-flex", "justify-content-center");
                    li.dataset.id = contato.id;

                    // Criando o card de contato com template literals
                    li.innerHTML = `
                        <div class="contact-card d-flex flex-column">
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

                    // Adicionando os eventos após inserir o HTML
                    setTimeout(() => {
                        li.querySelector(".edit").addEventListener("click", function (event) {
                            event.preventDefault();
                            const contatoId = this.getAttribute("data-id");
                            editarContato(contatoId);
                        });

                        li.querySelector(".delete").addEventListener("click", function (event) {
                            event.preventDefault();
                            const contatoId = this.getAttribute("data-id");
                            excluirContato(contatoId);
                        });
                    }, 0);


                    listaContatos.appendChild(li);
                });
            })
            .catch(error => console.error("Erro ao carregar contatos:", error));
    }


    // Função para adicionar um novo contato
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const nome = document.getElementById("nome").value;
        const sobrenome = document.getElementById("sobrenome").value;
        const numero = document.getElementById("numero").value;
        const email = document.getElementById("email").value;
        const foto = document.getElementById("foto").value;

        const novoContato = { nome, sobrenome, numero, email, foto };

        fetch(dbContatos, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoContato)
        })
            .then(response => response.json())
            .then(() => {
                carregarContatos();
                form.reset();
            })
            .catch(error => console.error("Erro ao adicionar contato:", error));
    });

    // Função para editar um contato
    function editarContato(id) {
        // Requisição para pegar os dados do contato
        fetch(`${dbContatos}/${id}`)
            .then(response => response.json())
            .then(contato => {
                // Preencher o formulário com os dados do contato
                document.getElementById('nome').value = contato.nome;
                document.getElementById('sobrenome').value = contato.sobrenome;
                document.getElementById('numero').value = contato.numero;
                document.getElementById('email').value = contato.email;
                document.getElementById('foto').value = contato.foto || '';
    
                // Adiciona um evento de submit para salvar as alterações
                document.getElementById('form-contato').onsubmit = function(event) {
                    event.preventDefault();  // Impede o envio do formulário
    
                    const nome = document.getElementById('nome').value;
                    const sobrenome = document.getElementById('sobrenome').value;
                    const numero = document.getElementById('numero').value;
                    const email = document.getElementById('email').value;
                    const foto = document.getElementById('foto').value;
    
                    // Enviar a requisição PUT para editar o contato
                    fetch(`${dbContatos}/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ nome, sobrenome, numero, email, foto })
                    })
                    .then(response => response.json())
                    .then(data => {
                        carregarContatos();  // Recarregar a lista de contatos
                        location.reload();
                    })
                    .catch(error => console.error('Erro ao editar o contato:', error));
                };
            })
            .catch(error => console.error('Erro ao carregar dados do contato:', error));
    }
    
    // Função para excluir um contato
    function excluirContato(id) {
        if (confirm("Tem certeza que deseja excluir este contato?")) {
            fetch(`${dbContatos}/${id}`, {
                method: "DELETE"
            })
                .then(response => {
                    if (response.ok) {
                        carregarContatos(); // Recarrega os contatos após a exclusão
                    } else {
                        return response.json().then(error => {
                            throw new Error(error.message || 'Erro ao excluir o contato');
                        });
                    }
                })
                .catch(error => {
                    console.error("Erro ao excluir contato:", error);
                    alert(error.message);
                });
        }
    }

    // Filtrar por categorias
    function filterContacts(category) {
        const contactCards = document.querySelectorAll('.contact-card');
        contactCards.forEach(card => {
            const contactCategory = card.getAttribute('data-category');
            if (category === 'all' || contactCategory === category) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }


    // Função de pesquisa
    function searchContacts() {
        const searchTerm = document.getElementById("search").value.toLowerCase();
        const contactCards = document.querySelectorAll('.contact-card');
        contactCards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const phone = card.querySelector('p').textContent.toLowerCase();
            const email = card.querySelectorAll('p')[1].textContent.toLowerCase();
            if (name.includes(searchTerm) || phone.includes(searchTerm) || email.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    }


    // Mudança de Estilo dos boiotões no Layout da Página
    document.getElementById("grid").addEventListener("click", function () {
        toggleFill("grid", "column");
    });
    document.getElementById("column").addEventListener("click", function () {
        toggleFill("column", "grid");
    });
    function toggleFill(activeId, inactiveId) {
        let activePaths = document.querySelectorAll(`#${activeId} path`);
        let inactivePaths = document.querySelectorAll(`#${inactiveId} path`);
        activePaths.forEach(path => path.setAttribute("fill", "#7451A5"));
        inactivePaths.forEach(path => path.setAttribute("fill", "#c2c2c2"));
    }


    // Função para fechar as opções dos cartões
    document.addEventListener("click", function (event) {
        document.querySelectorAll(".menueditcard").forEach(menu => {
            if (menu.hasAttribute("open") && !menu.contains(event.target)) {
                menu.removeAttribute("open");
            }
        });
    });


    // Carregar os contatos ao carregar a página
    // Exibir todos os contatos ao carregar a página
    carregarContatos();
    window.onload = function () {
        filterContacts('all');
    }
});
