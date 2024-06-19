//
//  SocketManager.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 15/06/2024.
//
import SocketIO
import AVFoundation

class SocketManager: ObservableObject {
    @Published var pressure: String = "Pressure: N/A"
    @Published var waterHeight: String = "Water Height: N/A"
    @Published var isVibrating: Bool = false
    @Published var isConnected: Bool = false
    @Published var showAlert: Bool = false

    var threshold: Double = 0.0

    private var manager: SocketIO.SocketManager?
    var socket: SocketIOClient?
    private var vibrationTimer: Timer?

    func setupSocket(serverURL: String) {
        manager = SocketIO.SocketManager(socketURL: URL(string: serverURL)!, config: [.log(true), .compress])
        socket = manager?.defaultSocket
        setupSocketEvents()
    }

    private func setupSocketEvents() {
        socket?.on(clientEvent: .connect) { [weak self] data, ack in
            print("Socket connected")
            DispatchQueue.main.async {
                self?.isConnected = true
            }
        }

        socket?.on("data") { [weak self] (dataArray, ack) in
            self?.handleSocketData(dataArray: dataArray)
        }

        socket?.on(clientEvent: .disconnect) { [weak self] data, ack in
            print("Socket disconnected")
            DispatchQueue.main.async {
                self?.isConnected = false
            }
        }

        socket?.on(clientEvent: .error) { data, ack in
            print("Socket error: \(data)")
        }
    }

    private func handleSocketData(dataArray: [Any]) {
        guard let data = dataArray[0] as? [String: Any],
              let pressureValue = data["pressure_hpa"] as? Double,
              let waterHeightValue = data["water_height"] as? Double else {
            return
        }
        
        DispatchQueue.main.async { [weak self] in
            self?.pressure = String(format: "Pressure: %.2f hPa", pressureValue)
            self?.waterHeight = String(format: "Water Height: %.2f cm", waterHeightValue)
            self?.checkThreshold(waterHeight: waterHeightValue)
        }
    }

    private func checkThreshold(waterHeight: Double) {
        if waterHeight > threshold {
            showAlert = true
            startVibrating()
        }
    }

    func startVibrating() {
        guard !isVibrating else { return }
        isVibrating = true
        vibrationTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
        }
    }

    func stopVibrating() {
        isVibrating = false
        vibrationTimer?.invalidate()
        vibrationTimer = nil
    }

    func connect() {
        if socket?.status != .connected {
            socket?.connect()
        }
    }

    func disconnect() {
        if socket?.status == .connected {
            socket?.disconnect()
        }
        stopVibrating()
    }
}
