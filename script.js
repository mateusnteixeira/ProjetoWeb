let boards = JSON.parse(localStorage.getItem("projetowebBoards")) || [];
let editingBoardId = null;
let editingCardInfo = null;

const boardsContainer = document.getElementById("boards-container");
const modalBoard = document.getElementById("modal-board");
const modalCard = document.getElementById("modal-card");

function salvarLocalStorage() {
    localStorage.setItem("projetowebBoards", JSON.stringify(boards));
}

function abrirModalBoard(editId = null) {
    editingBoardId = editId;
    modalBoard.classList.remove("hidden");

    if (editId !== null) {
        const board = boards.find(b => b.id === editId);
        document.getElementById("board-name").value = board.title;
        document.getElementById("modal-board-title").innerText = "Editar Quadro";
    } else {
        document.getElementById("board-name").value = "";
        document.getElementById("modal-board-title").innerText = "Novo Quadro";
    }
}

function fecharModalBoard() {
    modalBoard.classList.add("hidden");
}

document.getElementById("btn-novo-board").onclick = () => abrirModalBoard();

document.getElementById("btn-salvar-board").onclick = () => {
    const name = document.getElementById("board-name").value.trim();
    if (name === "") return;

    if (editingBoardId === null) {
        boards.push({
            id: Date.now(),
            title: name,
            cards: []
        });
    } else {
        const board = boards.find(b => b.id === editingBoardId);
        board.title = name;
    }

    salvarLocalStorage();
    renderBoards();
    fecharModalBoard();
};

document.getElementById("btn-cancelar-board").onclick = fecharModalBoard;

function abrirModalCard(boardId, cardId = null) {
    modalCard.classList.remove("hidden");
    editingCardInfo = { boardId, cardId };

    if (cardId !== null) {
        const board = boards.find(b => b.id === boardId);
        const card = board.cards.find(c => c.id === cardId);

        document.getElementById("card-title").value = card.title;
        document.getElementById("card-desc").value = card.desc;
        document.getElementById("modal-card-title").innerText = "Editar Cartão";
    } else {
        document.getElementById("card-title").value = "";
        document.getElementById("card-desc").value = "";
        document.getElementById("modal-card-title").innerText = "Novo Cartão";
    }
}

function fecharModalCard() {
    modalCard.classList.add("hidden");
}

document.getElementById("btn-salvar-card").onclick = () => {
    const { boardId, cardId } = editingCardInfo;

    const title = document.getElementById("card-title").value.trim();
    const desc = document.getElementById("card-desc").value.trim();
    if (title === "") return;

    const board = boards.find(b => b.id === boardId);

    if (cardId === null) {
        board.cards.push({
            id: Date.now(),
            title,
            desc
        });
    } else {
        const card = board.cards.find(c => c.id === cardId);
        card.title = title;
        card.desc = desc;
    }

    salvarLocalStorage();
    renderBoards();
    fecharModalCard();
};

document.getElementById("btn-cancelar-card").onclick = fecharModalCard;

function renderBoards() {
    boardsContainer.innerHTML = "";

    boards.forEach(board => {
        const boardEl = document.createElement("div");
        boardEl.classList.add("board");
        boardEl.dataset.id = board.id;

        boardEl.innerHTML = `
            <div class="board-header">
                <h3>${board.title}</h3>
                <div class="board-actions">
                    <button onclick="abrirModalCard(${board.id})">+ Cartão</button>
                    <button onclick="abrirModalBoard(${board.id})">✏️</button>
                    <button onclick="deletarBoard(${board.id})">🗑️</button>
                </div>
            </div>
            <div class="cards-container" ondrop="drop(event)" ondragover="allowDrop(event)">
            </div>
        `;

        board.cards.forEach(card => {
            const cardEl = document.createElement("div");
            cardEl.classList.add("card");
            cardEl.draggable = true;
            cardEl.dataset.id = card.id;
            cardEl.dataset.board = board.id;
            cardEl.ondragstart = drag;

            cardEl.innerHTML = `
                <h4>${card.title}</h4>
                <p>${card.desc}</p>
                <div class="card-actions">
                    <button onclick="abrirModalCard(${board.id}, ${card.id})">✏️</button>
                    <button onclick="deletarCard(${board.id}, ${card.id})">🗑️</button>
                </div>
            `;
            boardEl.querySelector(".cards-container").appendChild(cardEl);
        });

        boardsContainer.appendChild(boardEl);
    });
}

function deletarBoard(id) {
    boards = boards.filter(b => b.id !== id);
    salvarLocalStorage();
    renderBoards();
}

function deletarCard(boardId, cardId) {
    const board = boards.find(b => b.id === boardId);
    board.cards = board.cards.filter(c => c.id !== cardId);
    salvarLocalStorage();
    renderBoards();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("cardId", ev.target.dataset.id);
    ev.dataTransfer.setData("boardId", ev.target.dataset.board);
}

function drop(ev) {
    ev.preventDefault();

    const cardId = parseInt(ev.dataTransfer.getData("cardId"));
    const fromBoardId = parseInt(ev.dataTransfer.getData("boardId"));
    const toBoardId = parseInt(ev.target.closest(".board").dataset.id);

    if (fromBoardId === toBoardId) return;

    const fromBoard = boards.find(b => b.id === fromBoardId);
    const card = fromBoard.cards.find(c => c.id === cardId);
    fromBoard.cards = fromBoard.cards.filter(c => c.id !== cardId);

    const toBoard = boards.find(b => b.id === toBoardId);
    toBoard.cards.push(card);

    salvarLocalStorage();
    renderBoards();
}

document.getElementById("btn-exportar").onclick = () => {
    const dataStr = JSON.stringify(boards, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "projetoweb.json";
    a.click();
};

document.getElementById("btn-importar").onclick = () =>
    document.getElementById("input-importar").click();

document.getElementById("input-importar").onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = () => {
        boards = JSON.parse(reader.result);
        salvarLocalStorage();
        renderBoards();
    };

    reader.readAsText(file);
};

renderBoards();
