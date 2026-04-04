const broker = 'wss://broker.hivemq.com:8884/mqtt';
const topicSub = 'control/test1'; // Topic ESP32 gửi lên
const topicPub = 'control/device'; // Topic gửi lệnh xuống ESP32

const client = mqtt.connect(broker);

// Lấy các phần tử giao diện
const statusEl = document.getElementById('status');
const lightEl = document.getElementById('light-val');
const rainStatusEl = document.getElementById('rain-status');
const rainBoxEl = document.getElementById('rain-box');
const rackStatusEl = document.getElementById('rack-status');
const rackBoxEl = document.getElementById('rack-box');

client.on('connect', () => {
    statusEl.innerText = "Trạng thái: Đã kết nối";
    statusEl.className = "connected";
    client.subscribe(topicSub);
});

// CHỈ SỬ DỤNG 1 HÀM ON('MESSAGE') DUY NHẤT
client.on('message', (topic, message) => {
    const payload = message.toString();
    console.log("Dữ liệu nhận được:", payload); // Để bạn debug

    try {
        const data = JSON.parse(payload);
        
        // 1. Cập nhật Ánh sáng (mặc định 0 nếu thiếu)
        if (data.light == 1) {
            lightEl.innerText = "Trời tối";
        }
        else{
            lightEl.innerText = "Trời sáng";
        }

        // 2. Cập nhật Mưa (0 hoặc 1)
        if (data.rain !== undefined) {
            if (data.rain === 0) {
                rainStatusEl.innerText = "Có mưa";
                rainBoxEl.className = "box rain-active";
            } else {
                rainStatusEl.innerText = "Khô ráo";
                rainBoxEl.className = "box rain-dry";
            }
        }

        // 3. Cập nhật Giàn phơi (OUTSIDE hoặc INSIDE)
        if (data.rack !== undefined) {
            if (data.rack === "OUTSIDE") {
                rackStatusEl.innerText = "Đang ở ngoài";
                rackBoxEl.className = "box rack-outside";
            } else if (data.rack === "INSIDE") {
                rackStatusEl.innerText = "Đã thu vào";
                rackBoxEl.className = "box rack-inside";
            }
        }

    } catch (e) {
        console.error("Lỗi parse JSON:", e);
        // Nếu không phải JSON, in thô để kiểm tra
        lightEl.innerText = "Lỗi dữ liệu!";
    }
});

function sendControl(command) {
    if (client.connected) {
        client.publish(topicPub, command);
        console.log("Đã gửi lệnh:", command);
    } else {
        alert("Lỗi: Chưa kết nối MQTT!");
    }
}

client.on('error', (err) => {
    statusEl.innerText = "Lỗi kết nối!";
    statusEl.className = "disconnected";
});