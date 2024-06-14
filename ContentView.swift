//
//  ContentView.swift
//  CrisisiOS
//
//  Created by Tanush Reddy Arra on 06/06/2024.
//
import SwiftUI

struct ContentView: View {
    @StateObject private var socketManager = SocketManager()
    @State private var serverIP: String = ""
    
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
            
            Button(action: {
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
        }
        .padding()
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
