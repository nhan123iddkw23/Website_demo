const broker = 'wss://broker.hivemq.com:8884/mqtt';
const topicSub = 'control/test1'; // ESP32 gửi dữ liệu lên đây
const topicPub = 'control/device'; // Web gửi lệnh xuống đây

const client = mqtt.connect(broker);

// Lấy các phần tử giao diện
const statusEl = document.getElementById('status');
const lightEl = document.getElementById('light-val');
const rainStatusEl = document.getElementById('rain-status');
const rainBoxEl = document.getElementById('rain-box');
const rackStatusEl = document.getElementById('rack-status');
const rackBoxEl = document.getElementById('rack-box');

// Thêm vào đầu file các biến tham chiếu
const btnManual = document.getElementById('btn-manual');
const btnAuto = document.getElementById('btn-auto');

client.on('connect', () => {
    statusEl.innerText = "Trạng thái: Đã kết nối";
    statusEl.className = "connected";
    client.subscribe(topicSub);
});

client.on('message', (topic, message) => {
    const payload = message.toString();
    console.log("Dữ liệu từ ESP32:", payload);

    try {
        const data = JSON.parse(payload);
        
        // 1. Cập nhật Ánh sáng
        if (data.light !== undefined) {
            lightEl.innerText = (data.light === 1) ? "Trời tối" : "Trời sáng";
        }

        // 2. Cập nhật Cảm biến mưa
        if (data.rain !== undefined) {
            if (data.rain === 0) {
                rainStatusEl.innerText = "Có mưa";
                rainBoxEl.className = "box rain-active";
            } else {
                rainStatusEl.innerText = "Khô ráo";
                rainBoxEl.className = "box rain-dry";
            }
        }

        // 3. Cập nhật Vị trí giàn phơi
        if (data.rack !== undefined) {
            if (data.rack === "OUTSIDE") {
                rackStatusEl.innerText = "Đang ở ngoài";
                rackBoxEl.className = "box rack-outside";
            } else if (data.rack === "INSIDE") {
                rackStatusEl.innerText = "Đã thu vào";
                rackBoxEl.className = "box rack-inside";
            } else {
                rackStatusEl.innerText = "Đang di chuyển...";
                rackBoxEl.className = "box"; // Trạng thái trung gian
            }
        }

    } catch (e) {
        console.error("Lỗi dữ liệu JSON:", e);
    }
});

// Hàm gửi lệnh xuống ESP32 (ON, OFF, STOP)
function sendControl(command) {
    if (client.connected) {
        client.publish(topicPub, command);
        console.log("Đã gửi lệnh xuống ESP32:", command);
    } else {
        alert("Lỗi: Máy chủ MQTT chưa kết nối!");
    }
}

client.on('error', (err) => {
    statusEl.innerText = "Lỗi kết nối!";
    statusEl.className = "disconnected";
    console.error("MQTT Error:", err);
});

function setMode(mode) {
    // 1. Gửi lệnh qua MQTT
    client.publish(topicPub, mode); // Gửi 'AUTO' hoặc 'MANUAL' xuống ESP32
    console.log("Đã gửi chế độ:", mode);

    // 2. Cập nhật giao diện nút bấm
    if (mode === 'AUTO') {
        btnAuto.className = "btn btn-mode-active";
        btnManual.className = "btn btn-mode-inactive";
        // Vô hiệu hóa các nút điều khiển khi ở chế độ AUTO
        document.querySelectorAll('.controls .btn').forEach(b => b.disabled = true);
    } else {
        btnManual.className = "btn btn-mode-active";
        btnAuto.className = "btn btn-mode-inactive";
        // Kích hoạt lại các nút điều khiển
        document.querySelectorAll('.controls .btn').forEach(b => b.disabled = false);
    }
}