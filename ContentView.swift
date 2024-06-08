//
//  ContentView.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 06/06/2024.
//
import SwiftUI
import SocketIO

struct ContentView: View {
    @State private var pressure: String = "Pressure: N/A"
    @State private var waterHeight: String = "Water Height: N/A"
    
    // Use your MacBook's hostname
    let manager = SocketManager(socketURL: URL(string: "http://Tanush-Reddys-MacBook-Pro.local:3000")!, config: [.log(true), .compress])
    var socket: SocketIOClient

    init() {
        socket = manager.defaultSocket
    }

    var body: some View {
        VStack {
            Text(pressure)
                .font(.largeTitle)
                .padding()
            Text(waterHeight)
                .font(.title)
                .padding()
            Button(action: {
                self.connectSocket()
            }) {
                Text("Connect")
                    .padding()
                    .background(Color.blue)
                    .foregroundColor(.white)
                    .cornerRadius(8)
            }
        }
        .onAppear(perform: connectSocket)
    }
    
    func connectSocket() {
        socket.on(clientEvent: .connect) { data, ack in
            print("Socket connected")
        }

        socket.on("data") { (dataArray, ack) in
            if let data = dataArray[0] as? [String: Any],
               let pressureValue = data["pressure_hpa"] as? Double,
               let waterHeightValue = data["water_height"] as? Double {
                DispatchQueue.main.async {
                    self.pressure = String(format: "Pressure: %.2f hPa", pressureValue)
                    self.waterHeight = String(format: "Water Height: %.2f cm", waterHeightValue)
                }
            }
        }

        socket.connect()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
