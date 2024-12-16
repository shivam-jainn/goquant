"use client";
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
    const {role,setRole} = useOrderBookStore();
  
    const toggleAccountType = () => {
      setRole(
        role === e_OrderBookAccountType.client
          ? e_OrderBookAccountType.accmgr
          : e_OrderBookAccountType.client
      );
    };
  
    return (
      <div className="flex items-center justify-between m-3 border-[1px] border-gray/200 rounded-md px-4 py-2 shadow-md">
        {/* Logo Section */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-8 w-8"
          />
        </div>
  
        {/* User Dropdown Section */}
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
              {/* Toggle Account Type */}
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
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  