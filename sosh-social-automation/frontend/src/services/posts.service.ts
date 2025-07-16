import { apiClient } from './api-client';
import { API_ENDPOINTS, ApiSuccess } from '../types/api.types';

export interface Post {
  id: string;
  content: string;
  mediaUrls: string[];
  platforms: string[];
  hashtags: string[];
  scheduledFor?: Date;
  status: PostStatus;
  analytics?: PostAnalytics;
  createdAt: Date;
  updatedAt: Date;
}

export type PostStatus = 
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';

export interface PostAnalytics {
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    total: number;
  };
  reach: {
    total: number;
    organic: number;
    paid: number;
  };
  performance: {
    score: number;
    ranking: 'high' | 'medium' | 'low';
    benchmarkDiff: number;
  };
}

export interface CreatePostDto {
  content: string;
  mediaUrls?: string[];
  platforms: string[];
  hashtags?: string[];
  scheduledFor?: Date;
}

export interface PostFilter {
  status?: PostStatus;
  platform?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export class PostsService {
  private static instance: PostsService;

  private constructor() {}

  public static getInstance(): PostsService {
    if (!PostsService.instance) {
      PostsService.instance = new PostsService();
    }
    return PostsService.instance;
  }

  public async getPosts(filters?: PostFilter): Promise<Post[]> {
    const response = await apiClient.get<ApiSuccess<Post[]>>('/posts', {
      params: {
        ...filters,
        startDate: filters?.startDate?.toISOString(),
        endDate: filters?.endDate?.toISOString(),
      },
    });
    return response.data;
  }

  public async getPost(id: string): Promise<Post> {
    const response = await apiClient.get<ApiSuccess<Post>>(`/posts/${id}`);
    return response.data;
  }

  public async createPost(post: CreatePostDto): Promise<Post> {
    const response = await apiClient.post<ApiSuccess<Post>>('/posts', post);
    return response.data;
  }

  public async updatePost(id: string, post: Partial<CreatePostDto>): Promise<Post> {
    const response = await apiClient.put<ApiSuccess<Post>>(`/posts/${id}`, post);
    return response.data;
  }

  public async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  }

  public async uploadMedia(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiSuccess<{ url: string }>>(
      '/posts/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.url;
  }

  public async schedulePost(id: string, scheduledFor: Date): Promise<Post> {
    const response = await apiClient.put<ApiSuccess<Post>>(
      `/posts/${id}/schedule`,
      { scheduledFor }
    );
    return response.data;
  }

  public async publishNow(id: string): Promise<Post> {
    const response = await apiClient.post<ApiSuccess<Post>>(`/posts/${id}/publish`);
    return response.data;
  }

  public async cancelScheduled(id: string): Promise<Post> {
    const response = await apiClient.post<ApiSuccess<Post>>(`/posts/${id}/cancel`);
    return response.data;
  }

  public async getPostAnalytics(id: string): Promise<PostAnalytics> {
    const response = await apiClient.get<ApiSuccess<PostAnalytics>>(
      `/posts/${id}/analytics`
    );
    return response.data;
  }

  // Helper method to format post content with hashtags
  public formatPostContent(content: string, hashtags: string[]): string {
    if (!hashtags?.length) return content;
    return `${content}\n\n${hashtags.map(tag => `#${tag}`).join(' ')}`;
  }

  // Helper method to extract hashtags from content
  public extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    return Array.from(content.matchAll(hashtagRegex), match => match[1]);
  }

  // Helper method to validate post length for different platforms
  public validatePostLength(content: string, platform: string): boolean {
    const limits: { [key: string]: number } = {
      twitter: 280,
      instagram: 2200,
      facebook: 63206,
      linkedin: 3000,
    };
    return content.length <= (limits[platform] || Infinity);
  }
}

export const postsService = PostsService.getInstance();
