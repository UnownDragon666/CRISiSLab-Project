//
//  SocketManager.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 15/06/2024.
//
import Foundation
import SocketIO
import AVFoundation

class SocketManager: ObservableObject {
    @Published var pressure: String = "Pressure: N/A"
    @Published var waterHeight: String = "Water Height: N/A"
    @Published var isVibrating: Bool = false
    
    var threshold: Double = 0.0
    
    private var manager: SocketIO.SocketManager?
    private var socket: SocketIOClient?
    private var vibrationTimer: Timer?
    
    func setupSocket(serverURL: String) {
        manager = SocketIO.SocketManager(socketURL: URL(string: serverURL)!, config: [.log(true), .compress])
        socket = manager?.defaultSocket
        
        setupSocketEvents()
    }
    
    private func setupSocketEvents() {
        socket?.on(clientEvent: .connect) { data, ack in
            print("Socket connected")
        }

        socket?.on("data") { [weak self] (dataArray, ack) in
            if let data = dataArray[0] as? [String: Any],
               let pressureValue = data["pressure_hpa"] as? Double,
               let waterHeightValue = data["water_height"] as? Double {
                DispatchQueue.main.async {
                    self?.pressure = String(format: "Pressure: %.2f hPa", pressureValue)
                    self?.waterHeight = String(format: "Water Height: %.2f cm", waterHeightValue)
                    self?.checkThreshold(waterHeight: waterHeightValue)
                }
            }
        }
        
        socket?.on(clientEvent: .disconnect) { data, ack in
            print("Socket disconnected")
        }

        socket?.on(clientEvent: .error) { data, ack in
            print("Socket error: \(data)")
        }
    }
    
    private func checkThreshold(waterHeight: Double) {
        if waterHeight > threshold {
            startVibrating()
        } else {
            stopVibrating()
        }
    }
    
    private func startVibrating() {
        if !isVibrating {
            isVibrating = true
            vibrationTimer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
                AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
            }
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
