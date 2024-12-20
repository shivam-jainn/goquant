"use client";

import { useRouter } from 'next/navigation';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
  } from "@/components/ui/avatar";
  import { Button } from "@/components/ui/button";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
  import { useOrderBookStore, e_OrderBookAccountType } from "@/stores/orderbook-store";

  export function UserNav() {
    const {role,setRole,reset} = useOrderBookStore();
    const router = useRouter();

    const toggleAccountType = () => {
      setRole(
        role === e_OrderBookAccountType.client
          ? e_OrderBookAccountType.accmgr
          : e_OrderBookAccountType.client
      );
    };

    const handleLogoClick = () => {
      router.push("/");
    };

    return (
      <div className="flex items-center justify-between m-3 border-[1px] border-gray/200 rounded-md px-4 py-2 shadow-md">
        <button className="flex items-center gap-2 font-apple cursor-pointer" onClick={handleLogoClick}>
          <span><b className="text-green-400 cursor-pointer">Go</b>Quant</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/02.png" alt="Avatar" />
                <AvatarFallback>SC</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">shadcn</p>
                <p className="text-xs leading-none text-muted-foreground">
                  shivam@quantgo.io
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={toggleAccountType}
                className="flex items-center justify-between"
              >
                <span>Account Type</span>
                <span className="text-xs font-medium text-gray-500">
                  {role === e_OrderBookAccountType.client
                    ? "Client"
                    : "Account Manager"}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => reset()}
                className="flex items-center justify-between"
              >
                <span>Reset state</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }