import {NextRequest, NextResponse} from "next/server"
import connectDB from "@/lib/db"
import { sendMail } from "@/lib/mailer"
import Order from "@/models/order.model"

export async function POST(req:NextRequest){
    try {
       await connectDB()
       const {orderId} = await req.json()
       const order = await Order.findById(orderId).populate("user")
       if(!order){
        return NextResponse.json(
            {message:"order not found"},
            {status:4000}
        )
       }
       const otp = Math.floor(1000+Math.random()*9000).toString()
       order.deliveryOtp = otp
       await order.save()

       await sendMail(order.user.email , "Your Delivery Otp" , 
        `<h2>Your Delivery Otp is <strong>${otp}</strong></h2>`
    )
        return NextResponse.json(
            {message:"otp sent successfully"},
            {status : 200}
        )
    } catch (error) {
        return NextResponse.json(
            {message:`send otp error ${error}`},
            {status : 400}
        )
    }
}