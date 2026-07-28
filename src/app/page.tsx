import Image from "next/image";
import Link from "next/link";
import { NavBar } from "@/components/layout/NavBar";
import { Button } from "@/components/ui/Button";

/**
 * 메인 페이지. 여기 오는 사람은 둘 중 하나다.
 *   ① 방을 만들려는 사람  → 로그인/회원가입
 *   ② 디스코드 링크를 받고 온 참가자 → 입장 코드
 * 그래서 진입점을 두 개만 둔다. 그 외의 것은 넣지 않는다.
 *
 * TODO(A): 로그인 상태면 "방 만들기"를 "내 그룹으로" 로 바꾼다.
 */
export default function HomePage() {
  return (
    <>
      <NavBar />

      <main>
        {/* 마스트헤드 — 첫 화면 전체를 채워서 "이건 롤 내전 서비스다"를 즉시 각인시킨다 */}
        <section className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center overflow-hidden px-6 text-center">
          <Image
            src="/background.png"
            alt=""
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-bg/45" />

          <div className="relative flex flex-col items-center">
            <Image
              src="https://cmsassets.rgpub.io/sanity/images/dsfx7636/news/9eb028de391e65072d06e77f06d0955f66b9fa2c-736x316.png?accountingTag=LoL&auto=format&fit=fill&q=80&w=736"
              alt="League of Legends"
              width={368}
              height={158}
              className="h-auto w-[clamp(120px,40vw,525px)]"
              priority
            />
            <p className="mt-[clamp(0.625rem,3.75vw,2.1875rem)] font-extrabold tracking-tight text-text text-[clamp(1.125rem,6.25vw,3.75rem)]">
              롤 내전 서비스
            </p>

            <div className="mt-[clamp(1.875rem,5vw,3.125rem)] flex flex-wrap justify-center gap-4">
              <Link href="/signup">
                <Button variant="primary" className="!h-[3.4375rem] !px-[1.5625rem] !text-[1.25rem]">
                  방 만들기
                </Button>
              </Link>
              <Link href="/r/">
                <Button className="!h-[3.4375rem] !px-[1.5625rem] !text-[1.25rem]">
                  코드로 입장하기
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
