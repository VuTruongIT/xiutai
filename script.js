let predefinedResults = ['tai', 'xiu', 'tai', 'tai', 'xiu'];
let currentResultIndex = 0;
let baseMoney = 1000;
let adminMoney = 0;
let countdownTimer;
let timeLeft = 20; 
let playerChoice = null; 
let selectedButton = null;
let isBowlMoved = false; // Kiểm soát việc di chuyển bát

document.getElementById('tai').addEventListener('click', function() {
    selectChoice('tai', this);
});

document.getElementById('xiu').addEventListener('click', function() {
    selectChoice('xiu', this);
});

document.getElementById('reset').addEventListener('click', resetGame);
document.getElementById('withdraw').addEventListener('click', withdrawMoney);
document.getElementById('recharge').addEventListener('click', rechargeMoney);

startCountdown();

// Thêm khả năng kéo bát ra để xem kết quả
dragElement(document.getElementById("bowl"));

function startCountdown() {
    timeLeft = 20;
    document.getElementById('outcome').textContent = `Thời gian còn lại: ${timeLeft} giây`;

    countdownTimer = setInterval(function() {
        timeLeft--;
        document.getElementById('outcome').textContent = `Thời gian còn lại: ${timeLeft} giây`;

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            if (playerChoice !== null) {
                processGameResult(playerChoice);
            } else {
                document.getElementById('outcome').textContent = "Không chọn gì, game tự reset.";
                resetGame();
            }
            resetButtonColor();
            startCountdown();
        }
    }, 1000);
}

function selectChoice(choice, button) {
    playerChoice = choice;
    if (selectedButton !== null) {
        selectedButton.classList.remove('selected');
    }
    button.classList.add('selected');
    selectedButton = button;
}

function processGameResult(choice) {
    const betAmount = parseInt(document.getElementById('bet-amount').value);

    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Vui lòng nhập số tiền cược hợp lệ!");
        return;
    }

    if (betAmount > baseMoney) {
        alert("Bạn không có đủ tiền để cược!");
        return;
    }

    rollDice();

    setTimeout(function() {
        const expectedResult = predefinedResults[currentResultIndex];

        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        const dice3 = Math.floor(Math.random() * 6) + 1;
        const total = dice1 + dice2 + dice3;

        document.getElementById('dice1').textContent = dice1;
        document.getElementById('dice2').textContent = dice2;
        document.getElementById('dice3').textContent = dice3;

        document.getElementById('dice-result').textContent = `Xúc xắc: ${dice1}, ${dice2}, ${dice3} (Tổng: ${total})`;
        
        // Hiển thị xúc xắc sau khi có kết quả
        const diceElements = document.querySelectorAll('.dice');
        diceElements.forEach(dice => {
            dice.style.visibility = 'visible'; // Hiển thị xúc xắc
        });

        if (choice === expectedResult) {
            document.getElementById('outcome').textContent = `Kết quả: Bạn đã chọn đúng!`;
            baseMoney += betAmount;
        } else {
            document.getElementById('outcome').textContent = `Kết quả: Bạn đã chọn sai.`;
            baseMoney -= betAmount;
        }

        document.getElementById('current-money').textContent = `Tiền gốc: ${baseMoney}`;

        currentResultIndex++;
        if (currentResultIndex >= predefinedResults.length) {
            currentResultIndex = 0;
        }

        if (baseMoney <= 0) {
            alert("Bạn đã hết tiền! Game sẽ reset.");
            resetGame();
        }

        playerChoice = null;

        document.getElementById('bet-amount').value = ''; 

    }, 1000);
}

function rollDice() {
    const diceElements = document.querySelectorAll('.dice');
    diceElements.forEach(dice => {
        dice.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            dice.style.transform = 'rotate(0deg)';
        }, 500);
    });
}

function resetGame() {
    currentResultIndex = 0;
    baseMoney = 1000;
    playerChoice = null;
    selectedButton = null;
    isBowlMoved = false;
    document.getElementById('dice-result').textContent = 'Xúc xắc: ?';
    document.getElementById('outcome').textContent = 'Kết quả: ';
    document.getElementById('current-money').textContent = 'Tiền gốc: 1000';
    document.getElementById('withdrawn-money').textContent = 'Số tiền đã rút: 0';
    document.getElementById('admin-money').textContent = 'Tiền của admin: 0';
    clearInterval(countdownTimer);
    resetButtonColor();

    const diceElements = document.querySelectorAll('.dice');
    diceElements.forEach(dice => {
        dice.style.visibility = 'hidden'; // Ẩn xúc xắc khi reset
    });

    // Reset vị trí bát
    const bowl = document.getElementById('bowl');
    bowl.style.top = '25px';
    bowl.style.left = '25px';
}

function resetButtonColor() {
    if (selectedButton !== null) {
        selectedButton.classList.remove('selected');
    }
}

function dragElement(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        isBowlMoved = true;
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function withdrawMoney() {
    const withdrawAmount = baseMoney * 0.9;
    const adminFee = baseMoney * 0.1;
    baseMoney = 0;

    adminMoney += adminFee;

    document.getElementById('current-money').textContent = `Tiền gốc: ${baseMoney}`;
    document.getElementById('withdrawn-money').textContent = `Số tiền đã rút: ${withdrawAmount.toFixed(2)}`;
    document.getElementById('admin-money').textContent = `Tiền của admin: ${adminMoney.toFixed(2)}`;

    if (baseMoney <= 0) {
        alert("Bạn đã rút hết tiền! Số tiền còn lại là 0.");
    }
}

function rechargeMoney() {
    const rechargeAmount = parseInt(document.getElementById('recharge-amount').value);

    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
        alert("Vui lòng nhập số tiền nạp hợp lệ!");
        return;
    }

    baseMoney += rechargeAmount;

    document.getElementById('current-money').textContent = `Tiền gốc: ${baseMoney}`;
    document.getElementById('recharge-amount').value = '';
}
