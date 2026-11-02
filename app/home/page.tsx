import type { Metadata } from "next"
import AjakanNotifikasi from "../components/ajakan-notifikasi"
import CaraPinjam from "../components/cara-pinjam"
import Hero from "../components/hero"
import MauPinjam from "../components/mau-pinjam"
import RingkasanHariIni from "../components/ringkasan-hari-ini"

// /home = isi yang sama dengan Beranda → canonical ke "/" supaya tidak dianggap konten ganda
export const metadata: Metadata = { alternates: { canonical: "/" } }

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