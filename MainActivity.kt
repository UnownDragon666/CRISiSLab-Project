package com.example.pressuredataapp

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.android.volley.Request
import com.android.volley.RequestQueue
import com.android.volley.Response
import com.android.volley.toolbox.StringRequest
import com.android.volley.toolbox.Volley
import com.google.gson.JsonObject
import com.google.gson.JsonParser

class MainActivity : AppCompatActivity() {

    private lateinit var pressureTextView: TextView
    private lateinit var waterHeightTextView: TextView
    private lateinit var timestampTextView: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        pressureTextView = findViewById(R.id.pressureTextView)
        waterHeightTextView = findViewById(R.id.waterHeightTextView)
        timestampTextView = findViewById(R.id.timestampTextView)

        fetchData()
    }

    private fun fetchData() {
        val url = "http://YOUR_SERVER_IP:3000/latest"

        val queue: RequestQueue = Volley.newRequestQueue(this)

        val stringRequest = StringRequest(Request.Method.GET, url,
                Response.Listener<String> { response ->
                    val jsonObject: JsonObject = JsonParser.parseString(response).asJsonObject
                    val pressure = jsonObject.get("pressure_hpa").asDouble
                    val waterHeight = jsonObject.get("water_height").asDouble
                    val timestamp = jsonObject.get("timestamp").asString

                    pressureTextView.text = "Pressure: $pressure hPa"
                    waterHeightTextView.text = "Water Height: $waterHeight m"
                    timestampTextView.text = "Timestamp: $timestamp"
                },
                Response.ErrorListener {
                    pressureTextView.text = "Error fetching data"
                })

        queue.add(stringRequest)
    }
}
