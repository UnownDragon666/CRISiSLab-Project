//
//  ContentView.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 06/06/2024.
//
import SwiftUI
import AVFoundation

struct ContentView: View {
    @StateObject private var socketManager = SocketManager()
    @State private var serverIP: String = ""
    @State private var threshold: Double = 0.0
    @State private var isVibrating: Bool = false
    
    var body: some View {
        VStack {
            TextField("Enter server IP", text: $serverIP)
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.URL)
                .autocapitalization(.none)
            
            Text(socketManager.pressure)
                .font(.largeTitle)
                .padding()
            Text(socketManager.waterHeight)
                .font(.title)
                .padding()
            
            TextField("Enter water height threshold", value: $threshold, formatter: NumberFormatter())
                .padding()
                .textFieldStyle(RoundedBorderTextFieldStyle())
                .keyboardType(.decimalPad)
            
            Button(action: {
                socketManager.threshold = threshold
                socketManager.setupSocket(serverURL: "http://\(serverIP):3000")
                socketManager.connect()
            }) {
                Text("Connect")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .padding()
            
            Button(action: {
                socketManager.disconnect()
            }) {
                Text("Disconnect")
                    .padding()
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            
            Button(action: {
                isVibrating = false
            }) {
                Text("Stop Vibration")
                    .padding()
                    .background(Color.gray)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
            .padding()
            .disabled(!isVibrating)
        }
        .padding()
        .onReceive(socketManager.$isVibrating) { vibrating in
            isVibrating = vibrating
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
