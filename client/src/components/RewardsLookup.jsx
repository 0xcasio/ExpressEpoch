import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Search, Loader2 } from "lucide-react";
import { lookupRewards } from '../services/api';
import { useForm } from "react-hook-form";
import { Label } from "./ui/label";

// Predefined pool options - you can replace these with your actual pool data
const poolOptions = [
  { id: 'all', name: 'All Pools' },
  { id: '0x1234567890123456789012345678901234567890', name: 'ETH-USDC' },
  { id: '0x2345678901234567890123456789012345678901', name: 'BTC-USDC' },
  { id: '0x3456789012345678901234567890123456789012', name: 'ETH-BTC' },
  // Add more pools as needed
];

export default function RewardsLookup() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Initialize react-hook-form
  const form = useForm({
    defaultValues: {
      poolId: 'all',
      epoch: ''
    }
  });

  const onSubmit = async (data) => {
    if (!data.epoch) {
      setError('Please enter an epoch number');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await lookupRewards(data.poolId, data.epoch);
      
      if (response.success) {
        setResults(response.results);
        setHasSearched(true);
      } else {
        setError(response.error || 'An error occurred while fetching rewards');
        setResults([]);
      }
    } catch (error) {
      setError(error.message || 'An error occurred while fetching rewards');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Rewards Lookup</CardTitle>
          <CardDescription>
            Look up rewards for a specific epoch and pool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="poolId"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Pool</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a pool" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {poolOptions.map((pool) => (
                            <SelectItem key={pool.id} value={pool.id}>
                              {pool.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="epoch"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Epoch</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter epoch number"
                          min="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-end">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Lookup Rewards
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="text-destructive mt-2">{error}</div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
            <CardDescription>
              Rewards for epoch {form.watch('epoch')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool Name</TableHead>
                    <TableHead>Pool ID</TableHead>
                    <TableHead>Raw Result</TableHead>
                    <TableHead>Formatted Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, index) => (
                    <TableRow key={index}>
                      <TableCell>{result.poolName}</TableCell>
                      <TableCell className="font-mono text-xs">{result.poolId.substring(0, 10)}...</TableCell>
                      <TableCell>{result.result}</TableCell>
                      <TableCell>{result.formattedValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No results found
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 