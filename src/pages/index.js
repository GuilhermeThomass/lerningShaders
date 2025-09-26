import dynamic from 'next/dynamic'

const GlitchImage = dynamic(() => import('@/components/GlitchImage'), { ssr: false })

export default function Home() {
    return (
        <main className='flex h-screen w-screen justify-center items-center'>
            <div className='hover:scale-125 transition-transform duration-500 h-96' >
                <GlitchImage />
            </div>
        </main>
    )
}
