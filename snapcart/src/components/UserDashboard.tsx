import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDB from '@/lib/db'
import Grocery, { IGrocery } from '@/models/grocery.model'
import GroceryItemCard from './GroceryItemCard'

async function UserDashboard({groceryList} : {groceryList:IGrocery[]}) {
  await connectDB()
  const plainGrocery = JSON.parse(JSON.stringify(groceryList))
  return (
    <>
     <HeroSection/>
     <CategorySlider/>
     <div className='w-[90%] md:w-[80%] mx-auto mt-10'>
      <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center'>Popular Grocery Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {plainGrocery.map((item:any,index:number)=>(
        <GroceryItemCard key = {index} item={item}/>
     ))}
      </div>
     </div>
    </>
  )
}

export default UserDashboard