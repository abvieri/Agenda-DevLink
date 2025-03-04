document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form-contato");
    const listaContatos = document.getElementById("lista-contatos");

    // Função para carregar os contatos da API
    function carregarContatos() {
        fetch("http://localhost:3000/contatos")
            .then(response => response.json())
            .then(data => {
                listaContatos.innerHTML = "";
                data.forEach(contato => {
                    const li = document.createElement("li");
                    li.dataset.id = contato.id; // Guarda o ID do contato

                    // Div para exibir as informações do contato
                    const contactInfo = document.createElement("div");
                    contactInfo.classList.add("contact-info");
                    contactInfo.innerHTML = `
                        <strong>${contato.nome} ${contato.sobrenome}</strong><br>
                        <span>${contato.numero}</span><br>
                        <span>${contato.email}</span>
                    `;

                    // Botões para editar e excluir
                    const editButton = document.createElement("button");
                    editButton.classList.add("edit-btn");
                    editButton.textContent = "Editar";
                    editButton.onclick = () => editarContato(contato.id);

                    const deleteButton = document.createElement("button");
                    deleteButton.classList.add("delete-btn");
                    deleteButton.textContent = "Excluir";
                    deleteButton.onclick = () => excluirContato(contato.id);

                    li.appendChild(contactInfo);
                    li.appendChild(editButton);
                    li.appendChild(deleteButton);
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

        fetch("http://localhost:3000/contatos", {
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
        const nome = prompt("Digite o novo nome:");
        const sobrenome = prompt("Digite o novo sobrenome:");
        const numero = prompt("Digite o novo número:");
        const email = prompt("Digite o novo e-mail:");

        fetch(`http://localhost:3000/contatos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, sobrenome, numero, email })
        })
        .then(response => response.json())
        .then(() => carregarContatos())
        .catch(error => console.error("Erro ao editar contato:", error));
    }

    // Função para excluir um contato
    function excluirContato(id) {
        if (confirm("Tem certeza que deseja excluir este contato?")) {
            fetch(`http://localhost:3000/contatos/${id}`, {
                method: "DELETE"
            })
            .then(() => carregarContatos())
            .catch(error => console.error("Erro ao excluir contato:", error));
        }
    }

    // Carregar os contatos ao carregar a página
    carregarContatos();
});
