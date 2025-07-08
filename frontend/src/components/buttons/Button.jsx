export const Button = ({ Name }) => {

    const testAlert = () => {
        alert("กดทำไม")
    }
  return (
    <button className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 p-3 hover:scale-150 transition-all duration-1000" onClick={testAlert}>{Name}</button>
  )
}
