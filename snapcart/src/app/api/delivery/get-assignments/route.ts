import { auth } from "@/auth";
import connectDB from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextResponse } from "next/server";


export async function GET(){
    try{
        await connectDB()
        const session = await auth()
        const assignments = await DeliveryAssignment.find({
            broadcastedTo:session?.user?.id,
            status:"brodcasted"
        }).populate("order")
        return NextResponse.json(
            assignments,{status:200})
    }catch(error){
        return NextResponse.json(
            {message: `error ${error}`},{status:500})
    }
}