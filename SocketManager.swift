//
//  SocketManager.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 15/06/2024.
//
import Foundation
import SocketIO

class SocketManager: ObservableObject {
    @Published var pressure: String = "Pressure: N/A"
    @Published var waterHeight: String = "Water Height: N/A"
    
    private var manager: SocketIO.SocketManager?
    private var socket: SocketIOClient?
    
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
    
    func connect() {
        if socket?.status != .connected {
            socket?.connect()
        }
    }
    
    func disconnect() {
        if socket?.status == .connected {
            socket?.disconnect()
        }
    }
}
