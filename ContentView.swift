//
//  ContentView.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 06/06/2024.
//
import SwiftUI
import Combine

struct ContentView: View {
    @StateObject private var viewModel = SocketManagerViewModel(socketManager: SocketManager())
    @State private var serverIP: String = ""
    @State private var threshold: Double = 10.0
    @State private var standingWaterHeight: Double = 0.0
    @State private var showAlert: Bool = false
    @State private var showLoading: Bool = false
    @State private var cancellables = Set<AnyCancellable>()

    var body: some View {
        VStack {
            serverIPField
            
            if viewModel.isConnected {
                disconnectButton
                thresholdField
                standingWaterHeightField
                submitButton
                dataDisplay
            } else {
                connectButton
            }

            Spacer()
            if showLoading { loadingOverlay }
        }
        .padding()
        .alert(isPresented: $showAlert) {
            Alert(
                title: Text("Tsunami Warning"),
                message: Text("Evacuate To High Ground Immediately. Avoid Coastal Areas"),
                dismissButton: .default(Text("OK")) {
                    viewModel.stopVibrating()
                }
            )
        }
        .onAppear {
            bindConnectionState()
        }
    }
    
    private var serverIPField: some View {
        TextField("Enter server IP", text: $serverIP)
            .padding()
            .textFieldStyle(RoundedBorderTextFieldStyle())
            .keyboardType(.URL)
            .autocapitalization(.none)
    }
    
    private var connectButton: some View {
        Button(action: connectToServer) {
            Text("Connect")
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
        .padding()
        .disabled(viewModel.isConnected || showLoading)
    }
    
    private var disconnectButton: some View {
        Button(action: disconnectFromServer) {
            Text("Disconnect")
                .padding()
                .background(Color.red)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
        .padding()
    }
    
    private var thresholdField: some View {
        VStack(alignment: .leading) {
            Text("Threshold")
                .font(.headline)
                .padding(.bottom, 2)
            TextField("Enter Threshold", value: $threshold, formatter: NumberFormatter())
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.decimalPad)
        }
        .padding(.vertical)
    }
    
    private var standingWaterHeightField: some View {
        VStack(alignment: .leading) {
            Text("Standing Water Height")
                .font(.headline)
                .padding(.bottom, 2)
            TextField("Enter Standing Water Height", value: $standingWaterHeight, formatter: NumberFormatter())
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.decimalPad)
        }
        .padding(.vertical)
    }
    
    private var submitButton: some View {
        Button(action: submitValues) {
            Text("Submit")
                .padding()
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
        .padding()
    }
    
    private var dataDisplay: some View {
        VStack {
            Text(viewModel.waterHeight)
                .padding()
        }
    }
    
    private var loadingOverlay: some View {
        ZStack {
            Color.white.opacity(0.8)
                .ignoresSafeArea()
            VStack {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle())
                    .scaleEffect(1.5)
                    .padding()
                Text("Connecting...")
                    .font(.headline)
            }
            .padding()
            .background(RoundedRectangle(cornerRadius: 10).foregroundColor(Color.blue))
        }
        .edgesIgnoringSafeArea(.all)
    }

    private func connectToServer() {
        hideKeyboard()
        viewModel.threshold = threshold
        viewModel.standingWaterHeight = standingWaterHeight
        viewModel.setupSocket(serverURL: "http://\(serverIP):3000")
        viewModel.connect()
        showLoading = true
    }

    private func disconnectFromServer() {
        viewModel.disconnect()
        showLoading = true
    }

    private func submitValues() {
        hideKeyboard()
        viewModel.threshold = threshold
        viewModel.standingWaterHeight = standingWaterHeight
    }

    private func bindConnectionState() {
        viewModel.$isConnected
            .receive(on: RunLoop.main)
            .sink { connected in
                showLoading = !connected && viewModel.socketManager.socket?.status == .connecting
            }
            .store(in: &cancellables)

        viewModel.$showAlert
            .receive(on: RunLoop.main)
            .sink { showAlert in
                self.showAlert = showAlert
            }
            .store(in: &cancellables)
    }

    private func hideKeyboard() {
        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
    }
}
