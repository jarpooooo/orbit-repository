import AjakanNotifikasi from "../components/ajakan-notifikasi"
import CaraPinjam from "../components/cara-pinjam"
import Hero from "../components/hero"
import MauPinjam from "../components/mau-pinjam"
import RingkasanHariIni from "../components/ringkasan-hari-ini"

export default function Homepage(){
    return(
        <main>
            <Hero/>
            <RingkasanHariIni/>
            <MauPinjam/>
            <CaraPinjam/>
            <AjakanNotifikasi/>
        </main>
    )
}