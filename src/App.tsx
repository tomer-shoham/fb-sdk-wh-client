import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { TransactionResponse } from "./types/fireblocks/transaction-response";

function App() {
  const [transactionMap, setTransactionMap] = useState<
    Map<string, TransactionResponse>
  >(new Map());

  const upsertTransaction = (tx: TransactionResponse) => {
    setTransactionMap((prevMap) => {
      const updatedMap = new Map(prevMap);
      if (tx.id) {
        updatedMap.set(tx.id, tx);
      }
      return updatedMap;
    });
  };

  useEffect(() => {
    const socket = io("http://localhost:8000");

    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
    });

    socket.on("txUpdate", ({ type, data }) => {
      console.log("Received txUpdate type:", type);
      console.log("Received txUpdate:", data);
      upsertTransaction(data);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full px-6 py-5">
      <h1 className="text-xl font-bold">Transaction Monitor</h1>
      <section className="flex flex-col">
        {transactionMap.size > 0 ? (
          Array.from(transactionMap.values()).map((tx, index) => (
            <div
              key={index}
              className="my-5 w-96 rounded-2xl border border-black px-6 py-5"
            >
              <p className="text-sm text-zinc-500">{tx?.id}</p>
              <p className="text-md font-bold text-zinc-600">{tx?.operation}</p>
              <p
                className={`${
                  tx?.status === "COMPLETED"
                    ? "text-green-600"
                    : tx?.status === "REJECTED" ||
                        tx?.status === "FAILED" ||
                        tx?.status === "BLOCKED" ||
                        tx?.status === "CANCELLED"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {tx?.status}
              </p>
              <p>{tx?.amountInfo?.amount}</p>
              <p>{tx?.assetId}</p>
              <p>
                {tx?.source?.name} -{">"} {tx?.destination?.name}
              </p>
            </div>
          ))
        ) : (
          <p className="mt-5">Waiting for updates...</p>
        )}
      </section>
    </div>
  );
}

export default App;
