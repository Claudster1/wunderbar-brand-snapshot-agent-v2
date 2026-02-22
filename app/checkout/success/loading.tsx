export default function CheckoutSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Confirming your purchase...</p>
      </div>
    </div>
  );
}
