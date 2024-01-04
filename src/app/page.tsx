"use server";

export default async function index() {
  return (
    <>
      <h1>سلام دنیا</h1>
      <p>معرفی سایت</p>
      <a>ورود به فروشگاه</a>
      <input
        type="text"
        placeholder="جستوجو محصول در میان هزاران محصول موجود در فروشگاه"
      />
    </>
  );
}
