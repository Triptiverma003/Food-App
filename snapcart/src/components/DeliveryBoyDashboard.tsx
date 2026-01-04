'use client'

import { getSocket } from '@/lib/socket'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import LiveMap from './Livemap'
import DeliveryChat from './DeliveryChat'
import { Loader } from 'lucide-react'
import { BarChart } from 'recharts'
import { Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts'

interface ILocation {
  latitude: number
  longitude: number
}

function DeliveryBoyDashboard({earning}:{earning:number}) {
  const { userData } = useSelector((state: RootState) => state.user)

  const [assignments, setAssignments] = useState<any[]>([])
  const [activeOrder, setActiveOrder] = useState<any>(null)

  const [showOtpBox, setShowOtpBox] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpError, setOtpError] = useState('')

  const [sendOtpLoading, setSendOtpLoading] = useState(false)
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false)

  const [userLocation, setUserLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0
  })

  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState<ILocation>({
    latitude: 0,
    longitude: 0
  })

  /* -------------------- FETCH ASSIGNMENTS -------------------- */
  const fetchAssignments = async () => {
    try {
      const res = await axios.get('/api/delivery/get-assignments')
      setAssignments(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  /* -------------------- FETCH CURRENT ORDER -------------------- */
  const fetchCurrentOrder = async () => {
    try {
      const res = await axios.get('/api/delivery/current-order')
      if (res.data.active) {
        setActiveOrder(res.data.assignment)
        setUserLocation({
          latitude: res.data.assignment.order.address.latitude,
          longitude: res.data.assignment.order.address.longitude
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchAssignments()
    fetchCurrentOrder()
  }, [userData?._id])

  /* -------------------- ACCEPT ASSIGNMENT -------------------- */
  const handleAccept = async (id: string) => {
    try {
      await axios.get(`/api/delivery/assignment/${id}/accept-assignment`)
      setAssignments(prev => prev.filter(a => a._id !== id))
      fetchCurrentOrder()
    } catch (err) {
      console.log(err)
    }
  }

  /* -------------------- LOCATION TRACKING -------------------- */
  useEffect(() => {
    if (!userData?._id || !navigator.geolocation) return

    const socket = getSocket()

    const watcher = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords
        setDeliveryBoyLocation({ latitude, longitude })
        socket.emit('update-location', {
          userId: userData._id,
          latitude,
          longitude
        })
      },
      err => console.log(err),
      { enableHighAccuracy: true }
    )

    return () => navigator.geolocation.clearWatch(watcher)
  }, [userData?._id])

  /* -------------------- SOCKET EVENTS -------------------- */
  useEffect(() => {
    const socket = getSocket()

    socket.on('new-assignment', ({ deliveryAssignment }) => {
      setAssignments(prev => [...prev, deliveryAssignment])
    })

    socket.on('update-deliveryBoy-location', ({ location }) => {
      setDeliveryBoyLocation({
        latitude: location.coordinates[1],
        longitude: location.coordinates[0]
      })
    })

    return () => {
      socket.off('new-assignment')
      socket.off('update-deliveryBoy-location')
    }
  }, [])

  /* -------------------- OTP SEND -------------------- */
  const sendOtp = async () => {
    setSendOtpLoading(true)
    setOtpError('')

    try {
      await axios.post('/api/delivery/otp/send', {
        orderId: activeOrder.order._id
      })
      setShowOtpBox(true)
    } catch (err) {
      console.log(err)
    } finally {
      setSendOtpLoading(false)
    }
  }

  /* -------------------- OTP VERIFY -------------------- */
  const verifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      setOtpError('Please enter valid 4 digit OTP')
      return
    }

    setVerifyOtpLoading(true)
    setOtpError('')

    try {
      await axios.post('/api/delivery/otp/verify', {
        orderId: activeOrder.order._id,
        otp
      })

      setOtp('')
      setShowOtpBox(false)
      setActiveOrder(null)
      fetchCurrentOrder()
      window.location.reload()
    } catch (err) {
      setOtpError('OTP verification failed')
    } finally {
      setVerifyOtpLoading(false)
    }
  }

  if(!activeOrder && assignments.length === 0){

    const todayEarning=[
      {
        name:"Today",
        earning:earning,
        deliveries:earning/40
      }
    ]
    return(
      <div className = 'flex items-center justify-center min-h-screen bg-linear-to-br from-white to-green-50 p-6'>
        <div className='max-w-md w-full text-center'>
          <h2 className='text-2xl font-bold text-gray-800'>No active deliveries</h2>
          <p className='text-gray-500 mb-5'>Stay online to receive orders</p>
        
        <div className='bg-white border rounded-xl shadow-xl p-6'>
          <h2 className='font-medium text-green-700 mb-2'>Today's Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={todayEarning}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
           <XAxis dataKey="name" />
            <Tooltip  />
            <Bar dataKey="deliveries" fill="#16A34A" radius={[6, 6, 0, 0]}/>
                      </BarChart>
                  </ResponsiveContainer>
                  <p className= 'mt-4 text-lg font-bold text-green`'>{earning || 0} Earned today</p>
                  <button className = 'mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg'
                  onClick={()=>window.location.reload()}>Refresh</button>
        </div>
      </div>
      </div>
    )
  }

  /* -------------------- ACTIVE DELIVERY VIEW -------------------- */
  if (activeOrder) {
    return (
      <div className="p-4 pt-[120px] min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Active Delivery
          </h1>

          <p className="text-gray-600 text-sm mb-4">
            order#{activeOrder.order._id.slice(-6)}
          </p>

          <div className="rounded-xl border shadow-lg overflow-hidden mb-6">
            <LiveMap
              userLocation={userLocation}
              deliveryBoyLocation={deliveryBoyLocation}
            />
          </div>

          <DeliveryChat
            orderId={activeOrder.order._id}
            deliveryBoyId={userData?._id?.toString()!}
          />

          <div className="mt-6 bg-white rounded-xl border shadow p-6">
            {!activeOrder.order.deliveryOtpVerification && !showOtpBox && (
              <button
                onClick={sendOtp}
                className="w-full py-4 bg-green-600 text-white rounded-lg"
              >
                {sendOtpLoading ? (
                  <Loader className="animate-spin mx-auto" size={16} />
                ) : (
                  'Mark as Delivered'
                )}
              </button>
            )}

            {showOtpBox && (
              <div className="mt-4">
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={4}
                  placeholder="Enter OTP"
                  className="w-full py-3 border rounded-lg text-center"
                />

                <button
                  onClick={verifyOtp}
                  className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg"
                >
                  {verifyOtpLoading ? (
                    <Loader className="animate-spin mx-auto" size={16} />
                  ) : (
                    'Verify OTP'
                  )}
                </button>

                {otpError && (
                  <p className="text-red-600 mt-2 text-center">{otpError}</p>
                )}
              </div>
            )}

            {activeOrder.order.deliveryOtpVerification && (
              <div className="text-green-700 text-center font-bold">
                Delivered
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* -------------------- ASSIGNMENTS LIST -------------------- */
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mt-[120px] mb-6">
          Delivery Assignments
        </h2>

        {assignments.map(a => (
          <div key={a._id} className="p-5 bg-white rounded-xl shadow mb-4 border">
            <p>
              <b>Order Id</b> #{a.order._id.slice(-6)}
            </p>
            <p className="text-gray-600">{a.order.address.fullAddress}</p>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleAccept(a._id)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg"
              >
                Accept
              </button>
              <button className="flex-1 bg-red-600 text-white py-2 rounded-lg">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeliveryBoyDashboard
