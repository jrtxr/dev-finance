const Modal = {
    open(){
        // Abrir modal
        // Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')

    },
    close(){
        // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    //Função que calcula todas as transações de entrada
    incomes() {
        let income = 0;
        // Para cada transação
        Transaction.all.forEach(transaction => {
            //Se maior a transação for maior que zero
            if( transaction.amount > 0 ) {
                //Somando as transação de entrada
                income += transaction.amount;
            }
        })
        return income; //Retornando as entradas
    },

    //Função que calcula todas as transações de entrada
    expenses() {
        let expense = 0;
        // Para cada transação
        Transaction.all.forEach(transaction => {
            //Se menor a transação for maior que zero
            if( transaction.amount < 0 ) {
                //Somando as transação de saida
                expense += transaction.amount;
            }
        })
        return expense; //Retornando as entradas
    },

    //Função que calcula o total
    total() {
        return Transaction.incomes() + Transaction.expenses(); // Retornando a entrada - a saída
    }
}

const DOM = {
    // Buscando o tbody da tabela
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        // criando elemento na DOM
        const tr = document.createElement('tr')
        // Adicionado ao elemento criado o HTML da função innerHTMLTransaction
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        // 
        tr.dataset.index = index
        // Adicionado o elemento criado à tabela
        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        //Verificando se é uma transação de despesa ou receita
        //Caso for uma receita, seta a class income, ser não set a class expense
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        //
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
        </td>
        `

        return html
    },

    // Função que atualiza os valores de entrada e saida para mostrar na tela
    updateBalance() {
        //Atualiza as entradas
        document
            .getElementById('incomeDisplay')//atribuindo os valores calculado para o inner da class
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        //Atualiza as saidas
        document
            .getElementById('expenseDisplay')//atribuindo os valores calculado para o inner da class
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        //Atualiza os valor total
        document
            .getElementById('totalDisplay')//atribuindo os valores calculado para o inner da class
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() { // Limpando os valores
        DOM.transactionsContainer.innerHTML = ""
    }
}

// Objeto com funções para formatações
const Utils = {
    formatAmount(value){
        //Formatando o valor 
        value = Number(value.replace(/\,\./g, "")) * 100
        
        return value
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    // Formatando moeda
    formatCurrency(value) {
        //verificando se é despesa ou receita
        //caso for despesa atribui o sinal - a variavel
        const signal = Number(value) < 0 ? "-" : ""

        // Trocando o que não é número por ""
        value = String(value).replace(/\D/g, "")

        // DIvidindo o valor por 100 para criar as casa decimais
        value = Number(value) / 100

        // Transformando em moeda
        value = value.toLocaleString("pt-BR", { //informando o local
            style: "currency", //setando o estilo da moeda
            currency: "BRL" // setando a moeda
        })

        // retornando o valor mais  o sinal
        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues()
        
        if( description.trim() === "" || 
            amount.trim() === "" || 
            date.trim() === "" ) {
                throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()
            const transaction = Form.formatValues()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
    },
}

App.init()