//
//  SocketManagerViewModel.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 18/06/2024.
//
import SwiftUI
import Foundation
import Combine

class SocketManagerViewModel: ObservableObject {
    @Published var isConnected: Bool = false
    @Published var isVibrating: Bool = false
    @Published var pressure: String = "Pressure: N/A"
    @Published var waterHeight: String = "Water Height: N/A"
    @Published var showAlert: Bool = false
    var cancellables = Set<AnyCancellable>()

    private let socketManagerInstance: SocketManager

    var socketManager: SocketManager {
        return socketManagerInstance
    }

    var threshold: Double {
        get { socketManagerInstance.threshold }
        set { socketManagerInstance.threshold = newValue }
    }

    var standingWaterHeight: Double {
        get { socketManagerInstance.standingWaterHeight }
        set { socketManagerInstance.standingWaterHeight = newValue }
    }

    init(socketManager: SocketManager) {
        self.socketManagerInstance = socketManager
        setupBindings()
    }

    func setupSocket(serverURL: String) {
        socketManagerInstance.setupSocket(serverURL: serverURL)
    }

    func connect() {
        socketManagerInstance.connect()
    }

    func disconnect() {
        socketManagerInstance.disconnect()
    }

    func stopVibrating() {
        socketManagerInstance.stopVibrating()
    }

    private func setupBindings() {
        socketManagerInstance.$isConnected
            .assign(to: \.isConnected, on: self)
            .store(in: &cancellables)

        socketManagerInstance.$isVibrating
            .assign(to: \.isVibrating, on: self)
            .store(in: &cancellables)

        socketManagerInstance.$pressure
            .assign(to: \.pressure, on: self)
            .store(in: &cancellables)

        socketManagerInstance.$waterHeight
            .sink { [weak self] height in
                self?.waterHeight = height
                self?.checkAlarmCondition()
            }
            .store(in: &cancellables)
        
        socketManagerInstance.$showAlert
            .assign(to: \.showAlert, on: self)
            .store(in: &cancellables)
    }

    private func checkAlarmCondition() {
        guard let waterHeightDouble = Double(waterHeight.replacingOccurrences(of: "Water Height: ", with: "")) else { return }
        if waterHeightDouble - standingWaterHeight > threshold {
            showAlert = true
            // Implement vibration if needed
        }
    }
}

